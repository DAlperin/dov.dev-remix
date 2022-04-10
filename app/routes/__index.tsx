import type { LoaderFunction } from "remix";
import { useParams, useLoaderData, Outlet } from "remix";

import LayoutWrapper from "~/components/LayoutWrapper";
import SectionContainer from "~/components/SectionContainer";
import { themeSessionResolver } from "~/root";
import { isAuthenticated } from "~/services/auth.server";
import { getNavbarItems } from "~/utils/navbar.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { getTheme } = await themeSessionResolver(request);
    const user = await isAuthenticated(request);
    const isAuthed = user !== false;
    return {
        user,
        navItems: getNavbarItems(isAuthed),
        theme: getTheme(),
    };
};

export function CatchBoundary(): JSX.Element {
    const params = useParams();
    const loaderData = useLoaderData();
    const slug = params["*"];
    return (
        <SectionContainer>
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

export function ErrorBoundary(): JSX.Element {
    return (
        <div>
            <h2>500</h2>
            <h4>
                Something went wrong. This probably isn't your fault. Try again
                later.
            </h4>
        </div>
    );
}

export default function Index(): JSX.Element {
    const loaderData = useLoaderData();
    return (
        <SectionContainer>
            <LayoutWrapper
                user={loaderData.user}
                navItems={loaderData.navItems}
            >
                <Outlet />
            </LayoutWrapper>
        </SectionContainer>
    );
}
