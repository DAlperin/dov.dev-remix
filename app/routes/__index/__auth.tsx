import { AnimatePresence, motion } from "framer-motion";
import type { LinksFunction } from "remix";
import { useLocation, useOutlet } from "remix";

import AuthContainer from "~/components/AuthContainer";
import AuthFormWrapper from "~/components/AuthFormWrapper";
import styles from "~/styles/auth.css";

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export default function __auth(): JSX.Element {
    const location = useLocation();
    const outlet = useOutlet();
    return (
        <div className="flex items-center justify-center h-full flex-1">
            <AuthContainer>
                <AnimatePresence exitBeforeEnter>
                    <AuthFormWrapper>
                        <motion.div
                            key={location.key}
                            initial={{
                                translateX: 200,
                                opacity: 0,
                            }}
                            animate={{
                                translateX: 0,
                                opacity: 1,
                            }}
                            exit={{
                                translateX: -200,
                                opacity: 0,
                            }}
                        >
                            {outlet}
                        </motion.div>
                    </AuthFormWrapper>
                </AnimatePresence>
            </AuthContainer>
        </div>
    );
}
