import type { LoaderFunction } from "remix";
import { useLoaderData, Outlet } from "remix";

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
