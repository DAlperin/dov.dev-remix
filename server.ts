/* eslint sonarjs/cognitive-complexity: 0 */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
import "dotenv/config";
import api from "@opentelemetry/api";
import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import prometheusMiddleware from "express-prometheus-middleware";
import { readFileSync } from "fs";
import morgan from "morgan";
import path from "path";
import type { Key, PathFunction } from "path-to-regexp";
import { pathToRegexp, compile as compileRedirectPath } from "path-to-regexp";

const app = express();
const metricsApp = express();

app.use(
    prometheusMiddleware({
        metricsPath: "/metrics",
        metricsApp,
        collectDefaultMetrics: true,
        requestDurationBuckets: [0.1, 0.5, 1, 1.5],
        requestLengthBuckets: [512, 1024, 5120, 10_240, 51_200, 102_400],
        responseLengthBuckets: [512, 1024, 5120, 10_240, 51_200, 102_400],
        customLabels: ["region", "app", "instance"],
        transformLabels: (labels) => {
            // region: short 3 letter airport code for the region
            labels.region = process.env.FLY_REGION ?? "unknown";

            // app: the app exposing these metrics
            labels.app = process.env.FLY_APP_NAME ?? "unknown";

            // instance: your app instance ID
            labels.instance = process.env.FLY_ALLOC_ID ?? "unknown";
        },
    })
);

const metricsPort = process.env.METRICS_PORT ?? 9091;

type Redirect = {
    methods: string[];
    from: RegExp;
    keys: Key[];
    toPathname: PathFunction;
    toUrl: URL;
};

// h/t Kent C Dodds who this implementation is mostly ripped from
function buildRedirectsMiddleware(redirectsString: string) {
    const possibleMethods = [
        "HEAD",
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "*",
    ];
    const redirects = redirectsString
        .split("\n")
        .map((line, lineNum) => {
            if (!line.trim() || line.startsWith("#")) return null;
            const [one, two, three] = line
                .split(" ")
                .map((l) => l.trim())
                .filter(Boolean);
            if (!one) return null;
            const splitOne = one.split(",");

            let methods;
            let from;
            let to;
            // Check to see if we specify a method. Otherwise, assume all.
            if (possibleMethods.some((m) => splitOne.includes(m))) {
                methods = splitOne;
                from = two;
                to = three;
            } else {
                methods = ["*"];
                from = one;
                to = two;
            }
            if (!from || !to) {
                console.error(
                    `Invalid redirect on line ${lineNum + 1}: "${line}"`
                );
                return null;
            }
            const keys: Key[] = [];

            const toUrl = to.includes("//")
                ? new URL(to)
                : new URL(`https://same_host${to}`);
            try {
                return {
                    methods,
                    from: pathToRegexp(from, keys),
                    keys,
                    toPathname: compileRedirectPath(toUrl.pathname, {
                        encode: encodeURIComponent,
                    }),
                    toUrl,
                };
            } catch {
                // if parsing the redirect fails, we'll warn, but we won't crash
                console.error(
                    `Failed to parse redirect on line ${lineNum}: "${line}"`
                );
                return null;
            }
        })
        .filter((e): e is Redirect => {
            return e !== null;
        });

    return function redirectsMiddleware(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        const host = req.header("X-Forwarded-Host") ?? req.header("host");
        const protocol = host?.includes("localhost") ? "http" : "https";
        let reqUrl;
        try {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            reqUrl = new URL(`${protocol}://${host}${req.url}`);
        } catch {
            console.error(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `Invalid URL: ${protocol}://${host}${req.url}`
            );
            next();
            return;
        }
        for (const redirect of redirects) {
            try {
                if (
                    !redirect.methods.includes("*") &&
                    !redirect.methods.includes(req.method)
                ) {
                    continue;
                }

                const match = redirect.from.exec(req.path);
                if (!match) continue;

                const params: Record<string, string> = {};
                const paramValues = match.slice(1);
                for (
                    let paramIndex = 0;
                    paramIndex < paramValues.length;
                    paramIndex++
                ) {
                    const paramValue = paramValues[paramIndex];
                    const key = redirect.keys[paramIndex];
                    if (key && paramValue) {
                        params[key.name] = paramValue;
                    }
                }
                const { toUrl } = redirect;

                toUrl.protocol = protocol;
                if (toUrl.host === "same_host") toUrl.host = reqUrl.host;

                for (const [key, value] of reqUrl.searchParams.entries()) {
                    toUrl.searchParams.append(key, value);
                }

                toUrl.pathname = redirect.toPathname(params);
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "*");
                res.setHeader("Access-Control-Allow-Headers", "*");
                res.redirect(307, toUrl.toString());
                return;
            } catch (error: unknown) {
                // an error in the redirect shouldn't stop the request from going through
                console.error(`Error processing redirects:`, {
                    error,
                    redirect,
                    "req.url": req.url,
                });
            }
        }
        next();
    };
}

metricsApp.listen(metricsPort, () => {
    console.log(`✅ metrics ready: http://localhost:${metricsPort}`);
});

const noCleanUrls = new Set(["/studio/"]);

app.use((req, res, next) => {
    const activeSpan = api.trace.getActiveSpan();
    // helpful headers:
    res.set("x-fly-region", process.env.FLY_REGION ?? "unknown");
    res.set("Strict-Transport-Security", `max-age=${60 * 60 * 24 * 365 * 100}`);
    if (activeSpan) {
        res.set("trace-id", activeSpan.spanContext().traceId);
    }

    // /clean-urls/ -> /clean-urls
    if (
        req.path.endsWith("/") &&
        req.path.length > 1 &&
        !noCleanUrls.has(req.path)
    ) {
        const query = req.url.slice(req.path.length);
        const safepath = req.path.slice(0, -1).replace(/\/+/gu, "/");
        res.redirect(301, `${safepath}${query}`);
        return;
    }
    next();
});

// Remix fingerprints its assets so we can cache forever.
app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

// Mount the sanity studio react router app
app.use(
    "/studio/*",
    express.static("public/studio/index.html", { maxAge: "1h" })
);

const here = (...d: string[]) => path.join(__dirname, ...d);
app.all(
    "*",
    buildRedirectsMiddleware(readFileSync(here("../_redirects"), "utf8"))
);

app.all("*", (req: express.Request, res, next) => {
    const { FLY_REGION, NODE_ENV } = process.env;
    if (
        req.query.forceRegion !== undefined &&
        req.query.forceRegion !== FLY_REGION &&
        NODE_ENV === "production"
    ) {
        console.log(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            `Replaying because of forceRegion. Replaying to ${req.query.forceRegion} from ${FLY_REGION}`
        );
        // eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions
        res.set("fly-replay", `region=${req.query.forceRegion}`);
        return res.sendStatus(409);
    }
    next();
});

// if we're not in the primary region, then we need to make sure all
// non-GET/HEAD/OPTIONS requests hit the primary region. In theory,
// it's fine to directly connect to planetscale but latency would be
// high since currently we can only connect to it via us-east-1
// app.all("*", (req, res, next) => {
//     const { method, path: pathname } = req;
//     const { PRIMARY_REGION, FLY_REGION } = process.env;
//
//     const isMethodReplayable = !["GET", "OPTIONS", "HEAD"].includes(method);
//     const isReadOnlyRegion =
//         FLY_REGION && PRIMARY_REGION && FLY_REGION !== PRIMARY_REGION;
//
//     const shouldReplay = isMethodReplayable && isReadOnlyRegion;
//
//     if (!shouldReplay) {
//         next();
//         return;
//     }
//
//     const logInfo = {
//         pathname,
//         method,
//         PRIMARY_REGION,
//         FLY_REGION,
//     };
//     console.info(`Replaying:`, logInfo);
//     res.set("fly-replay", `region=${PRIMARY_REGION}`);
//     return res.sendStatus(409);
// });

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

app.use(morgan("tiny"));

const MODE = process.env.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), "build");

app.all(
    "*",
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    MODE === "production"
        ? createRequestHandler({ build: require(BUILD_DIR) })
        : (...args) => {
              purgeRequireCache();
              const requestHandler = createRequestHandler({
                  build: require(BUILD_DIR),
                  mode: MODE,
              });
              return requestHandler(...args);
          }
);

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
    // require the built app, so we're ready when the first request comes in
    require(BUILD_DIR);
    console.log(`✅ app ready: http://localhost:${port}`);
});

function purgeRequireCache() {
    // purge require cache on requests for "server side HMR" this won't let
    // you have in-memory objects between requests in development,
    // alternatively you can set up nodemon/pm2-dev to restart the server on
    // file changes, we prefer the DX of this though, so we've included it
    // for you by default
    for (const key in require.cache) {
        if (key.startsWith(BUILD_DIR)) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete require.cache[key];
        }
    }
}
