import { SwitchTransition, CSSTransition } from "react-transition-group";
import type { LinksFunction } from "remix";
import { useLocation, useOutlet } from "remix";

import styles from "../styles/auth.css";
import AuthContainer from "~/components/AuthContainer";
import AuthFormWrapper from "~/components/AuthFormWrapper";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export default function Auth(): JSX.Element {
    const location = useLocation();
    const outlet = useOutlet();
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
