/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import prometheusMiddleware from 'express-prometheus-middleware';
import morgan from "morgan";
import path from "path";

const app = express();
if (process.env.ENABLE_METRICS) {
    const metricsApp = express();

    app.use(
        prometheusMiddleware({
            metricsPath: '/metrics',
            metricsApp,
            collectDefaultMetrics: true,
            requestDurationBuckets: [0.1, 0.5, 1, 1.5],
            requestLengthBuckets: [512, 1024, 5120, 10_240, 51_200, 102_400],
            responseLengthBuckets: [512, 1024, 5120, 10_240, 51_200, 102_400],
            customLabels: ['region', 'app', 'instance'],
            transformLabels: labels => {
                // region: short 3 letter airport code for the region
                labels.region = process.env.FLY_REGION ?? 'unknown';

                // app: the app exposing these metrics
                labels.app = process.env.FLY_APP_NAME ?? 'unknown';

                // instance: your app instance ID
                labels.instance = process.env.FLY_ALLOC_ID ?? 'unknown';
            },
        })
    );

    const metricsPort = process.env.METRICS_PORT ?? 9091;

    metricsApp.listen(metricsPort, () => {
        console.log(`✅ metrics ready: http://localhost:${metricsPort}`);
    });
}

app.use((req, res, next) => {
    // helpful headers:
    res.set("x-fly-region", process.env.FLY_REGION ?? "unknown");
    res.set("Strict-Transport-Security", `max-age=${60 * 60 * 24 * 365 * 100}`);

    // /clean-urls/ -> /clean-urls
    if (req.path.endsWith("/") && req.path.length > 1) {
        const query = req.url.slice(req.path.length);
        const safepath = req.path.slice(0, -1).replace(/\/+/gu, "/");
        res.redirect(301, `${safepath}${query}`);
        return;
    }
    next();
});

// if we're not in the primary region, then we need to make sure all
// non-GET/HEAD/OPTIONS requests hit the primary region. In theory
// it's fine to directly connect to planetscale but latency would be
// high since currently we can only connect to it via us-east-1
app.all("*", (req, res, next) => {
    const { method, path: pathname } = req;
    const { PRIMARY_REGION, FLY_REGION } = process.env;

    const isMethodReplayable = !["GET", "OPTIONS", "HEAD"].includes(method);
    const isReadOnlyRegion =
        FLY_REGION && PRIMARY_REGION && FLY_REGION !== PRIMARY_REGION;

    const shouldReplay = isMethodReplayable && isReadOnlyRegion;

    if (!shouldReplay) { next(); return; }

    const logInfo = {
        pathname,
        method,
        PRIMARY_REGION,
        FLY_REGION,
    };
    console.info(`Replaying:`, logInfo);
    res.set("fly-replay", `region=${PRIMARY_REGION}`);
    return res.sendStatus(409);
});

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

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
    // require the built app so we're ready when the first request comes in
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