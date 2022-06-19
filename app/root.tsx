import {
    Links,
    Meta,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useLocation,
    useSubmit,
    useTransition,
    LiveReload,
} from "@remix-run/react";
import type {
    LinksFunction,
    LoaderFunction,
    MetaFunction,
} from "@remix-run/server-runtime";
import { load } from "fathom-client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Outlet } from "remix";
import {
    createThemeSessionResolver,
    PreventFlashOnWrongTheme,
    Theme,
    ThemeProvider,
    useTheme,
} from "remix-themes";
import { ClientOnly } from "remix-utils";
import { useSpinDelay } from "spin-delay";

import styles from "./tailwind.css";
import { auth, isAuthenticated } from "~/services/auth.server";

// @ts-expect-error TODO: write types...
import CommandPalette from "react-command-palette"; // eslint-disable-line

import {
    commitSession,
    getSession,
    sessionStorage,
} from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { getTheme } = await themeSessionResolver(request);
    const user = await isAuthenticated(request);
    const session = await getSession(request.headers.get("cookie"));
    // eslint-disable-next-line unicorn/no-unsafe-regex
    if (!/\/auth\/?(\S+)?/u.test(new URL(request.url).pathname)) {
        session.unset(`__flash_${auth.sessionErrorKey}__`);
        await commitSession(session);
    }
    return {
        theme: getTheme(),
        user,
    };
};

let firstRender = true;

// h/t to kentcdodds who heavily inspired this implementation
function PageLoadingMessage() {
    const transition = useTransition();
    const [pendingPath, setPendingPath] = useState<string | null>();
    const [message, setMessage] = useState<string | null>();
    const showLoader = useSpinDelay(Boolean(transition.state !== "idle"), {
        delay: 400,
        minDuration: 1000,
    });

    useEffect(() => {
        if (firstRender) return;
        if (transition.state === "idle") return;
        if (transition.state === "submitting") {
            setMessage("Submitting...");
            setPendingPath(null);
        } else {
            setPendingPath(transition.location.pathname);
            setMessage(null);
        }
    }, [transition]);

    useEffect(() => {
        firstRender = false;
    }, []);

    return (
        <AnimatePresence>
            {showLoader ? (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0 } }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className="pointer-events-none fixed left-0 right-0 z-50 px-5vw bottom-8"
                >
                    <div className="mx-auto flex w-11/12 max-w-8xl justify-end">
                        <div className="bg-gray-900 dark:bg-gray-600 text-inverse pointer-events-auto relative max-w-xl rounded-lg p-8 pr-14 shadow-md">
                            <div className="flex w-64 items-center">
                                <div className="blob fill-neutral-500">
                                    {/* This SVG is from https://codepen.io/Ali_Farooq_/pen/gKOJqx */}
                                    <svg
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        version="1.1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 310 350"
                                    >
                                        <path d="M156.4,339.5c31.8-2.5,59.4-26.8,80.2-48.5c28.3-29.5,40.5-47,56.1-85.1c14-34.3,20.7-75.6,2.3-111  c-18.1-34.8-55.7-58-90.4-72.3c-11.7-4.8-24.1-8.8-36.8-11.5l-0.9-0.9l-0.6,0.6c-27.7-5.8-56.6-6-82.4,3c-38.8,13.6-64,48.8-66.8,90.3c-3,43.9,17.8,88.3,33.7,128.8c5.3,13.5,10.4,27.1,14.9,40.9C77.5,309.9,111,343,156.4,339.5z" />
                                    </svg>
                                </div>
                                <div className="ml-4 inline-grid">
                                    <AnimatePresence>
                                        <div className="col-start-1 row-start-1 flex overflow-hidden">
                                            <motion.span
                                                initial={{ y: 15, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -15, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="text-white dark:text-inherit flex-none"
                                            >
                                                Loading
                                            </motion.span>
                                        </div>
                                    </AnimatePresence>
                                    {pendingPath ? (
                                        <span className="text-white dark:text-inherit truncate">
                                            path: {pendingPath}
                                        </span>
                                    ) : null}
                                    {message ? <span>{message}</span> : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);

export const meta: MetaFunction = () => {
    return {
        title: "Dov Alperin",
        robots: "follow, index",
        description: "Dov Alperins personal website",
        "og:type": "website",
        "og:site_name": "dov.dev",
        "og:title": "dov.dev",
    };
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export default function AppWithProviders(): JSX.Element {
    const data = useLoaderData();
    return (
        <ThemeProvider
            specifiedTheme={data.theme}
            themeAction="/action/set-theme"
        >
            <App />
        </ThemeProvider>
    );
}

function App(): JSX.Element {
    const submit = useSubmit();
    const location = useLocation();
    const data = useLoaderData();
    const [theme, setTheme] = useTheme();
    const transition = useTransition();
    const showLoader = useSpinDelay(Boolean(transition.state === "loading"), {
        delay: 400,
        minDuration: 500,
    });
    const commands = [
        {
            name: "Toggle theme",
            command() {
                setTheme((prev) =>
                    prev === Theme.DARK ? Theme.LIGHT : Theme.DARK
                );
            },
        },
    ];
    useEffect(() => {
        if (data.user)
            commands.push({
                name: "Logout",
                command() {
                    submit(null, { method: "post", action: "/api/logout" });
                },
            });
    });
    return (
        <html lang="en" className={theme ?? ""}>
            <head>
                <title>Dov Alperin</title>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1"
                />
                <meta
                    name="og:url"
                    content={`https://dov.dev${location.pathname}`}
                />
                <script
                    src="https://thirtyeight-stupendous.d0va1p.net/script.js"
                    data-site="YXSYHQER"
                    defer
                />
                <Meta />
                <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
                <Links />
            </head>
            <body className="antialiased text-black bg-white dark:bg-gray-900 dark:text-white w-full min-h-full">
                <PageLoadingMessage />
                <ClientOnly>
                    {() => {
                        return (
                            <CommandPalette
                                commands={commands}
                                closeOnSelect
                                hotKeys="ctrl+/"
                            />
                        );
                    }}
                </ClientOnly>
                <div
                    className={`${
                        showLoader ? "opacity-30" : ""
                    } relative min-h-full overflow-x-hidden`}
                >
                    <Outlet />
                </div>
                <ScrollRestoration />
                <Scripts />
                {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
            </body>
        </html>
    );
}
