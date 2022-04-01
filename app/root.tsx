import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useTransition,
} from "remix";
import type { MetaFunction, LoaderFunction, LinksFunction } from "remix";
import {
    createThemeSessionResolver,
    ThemeProvider,
    useTheme,
    PreventFlashOnWrongTheme,
} from "remix-themes";
import { useSpinDelay } from "spin-delay";

import styles from "./tailwind.css";
import { isAuthenticated } from "~/services/auth.server";
import { sessionStorage } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { getTheme } = await themeSessionResolver(request);
    const user = await isAuthenticated(request);
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
                        <div className="bg-gray-300 dark:bg-gray-600 text-inverse pointer-events-auto relative max-w-xl rounded-lg p-8 pr-14 shadow-md">
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
                                                className="flex-none"
                                            >
                                                Loading
                                            </motion.span>
                                        </div>
                                    </AnimatePresence>
                                    {pendingPath ? (
                                        <span className="truncate">
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
    return { title: "New Remix App" };
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
    const data = useLoaderData();
    const [theme] = useTheme();
    const transition = useTransition();
    const showLoader = useSpinDelay(Boolean(transition.state === "loading"), {
        delay: 400,
        minDuration: 500,
    });
    return (
        <html lang="en" className={theme ?? ""}>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1"
                />
                <Meta />
                <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
                <Links />
            </head>
            <body className="antialiased text-black bg-white dark:bg-gray-900 dark:text-white w-full h-full">
                <PageLoadingMessage />
                <div className={showLoader ? "opacity-30" : ""}>
                    <Outlet />
                </div>
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
