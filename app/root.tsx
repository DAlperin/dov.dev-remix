import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "remix";
import type { MetaFunction, LoaderFunction, LinksFunction } from "remix";
import {
    createThemeSessionResolver,
    ThemeProvider,
    useTheme,
    PreventFlashOnWrongTheme,
} from "remix-themes";

import LayoutWrapper from "./components/LayoutWrapper";
import styles from "./tailwind.css";
import { isAuthenticated } from "~/utils/auth.server";
import { getNavbarItems } from "~/utils/navbar.server";
import { getSession, sessionStorage } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { getTheme } = await themeSessionResolver(request);
    const user = await isAuthenticated(request);
    const isAuthed = user !== false;
    return {
        theme: getTheme(),
        user,
        navItems: getNavbarItems(isAuthed),
    };
};

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
            <body className="antialiased text-black bg-white dark:bg-gray-900 dark:text-white w-full">
                <LayoutWrapper user={data.user} navItems={data.navItems}>
                    <Outlet />
                </LayoutWrapper>
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
