import { useParams, useLoaderData, Outlet } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";

import LayoutWrapper from "~/components/LayoutWrapper";
import SectionContainer from "~/components/SectionContainer";
import { themeSessionResolver } from "~/root";
import { isAuthenticated } from "~/services/auth.server";
import { assertedEnvVar } from "~/utils/environment.server";
import { getNavbarItems } from "~/utils/navbar.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { getTheme } = await themeSessionResolver(request);
    const user = await isAuthenticated(request);
    const isAuthed = user !== false;
    let region = "developement";
    if (process.env.NODE_ENV === "production") {
        region = assertedEnvVar("FLY_REGION");
    }

    return {
        user,
        navItems: getNavbarItems(isAuthed),
        theme: getTheme(),
        region,
        time: new Date().toUTCString(),
    };
};

export function CatchBoundary(): JSX.Element {
    const params = useParams();
    const loaderData = useLoaderData();
    const slug = params["*"];
    return (
        <SectionContainer region={loaderData.region} time={loaderData.time}>
            <LayoutWrapper
                user={loaderData.user}
                navItems={loaderData.navItems}
            >
                <h2>We couldn't find that page!</h2>
                <h4>
                    We couldnt find <em>{slug}</em> if you think it should be
                    here contact us dov@dov.dev
                </h4>
            </LayoutWrapper>
        </SectionContainer>
    );
}

export function ErrorBoundary({ error }: { error: Error }): JSX.Element {
    return (
        <SectionContainer fullWidth>
            <div className="h-full flex-1 mt-10">
                <h2>500</h2>
                <h4>
                    Something went wrong. This probably isn't your fault. Try
                    again later.
                </h4>
                <pre>{error.message}</pre>
                <pre>{error.stack}</pre>
            </div>
        </SectionContainer>
    );
}

export default function Index(): JSX.Element {
    const loaderData = useLoaderData();
    return (
        <SectionContainer region={loaderData.region} time={loaderData.time}>
            <LayoutWrapper
                user={loaderData.user}
                navItems={loaderData.navItems}
            >
                <Outlet />
            </LayoutWrapper>
        </SectionContainer>
    );
}
