import { SwitchTransition, CSSTransition } from "react-transition-group";
import type { LinksFunction, LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { useLocation, useOutlet } from "remix";

import styles from "../../styles/auth.css";
import AuthContainer from "~/components/AuthContainer";
import AuthFormWrapper from "~/components/AuthFormWrapper";
import { isAuthenticated } from "~/services/auth.server";
import { getNavbarItems } from "~/utils/navbar.server";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await isAuthenticated(request);
    const isAuthed = user !== false;
    return {
        user,
        navItems: getNavbarItems(isAuthed),
    };
};

export default function __auth(): JSX.Element {
    const location = useLocation();
    const outlet = useOutlet();
    const loaderData = useLoaderData();
    return (
        <div className="flex items-center justify-center h-full">
            <AuthContainer>
                <SwitchTransition>
                    <CSSTransition
                        key={location.pathname}
                        addEndListener={(node, done) => {
                            node.addEventListener("animationend", done, false);
                        }}
                        classNames={{
                            enterActive: "animate_fadeInRight",
                            exitActive: "animate_fadeOutLeft",
                        }}
                    >
                        <AuthFormWrapper>{outlet}</AuthFormWrapper>
                    </CSSTransition>
                </SwitchTransition>
            </AuthContainer>
        </div>
    );
}
