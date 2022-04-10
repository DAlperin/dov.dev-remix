import type { ReactNode } from "react";

import Footer from "./Footer";

type Props = {
    children: ReactNode;
};

export default function SectionContainer({ children }: Props): JSX.Element {
    return (
        <div className="flex flex-col min-h-screen min-w-full">
            <div className="max-w-3xl px-4 mx-auto sm:px-6 xl:max-w-5xl xl:px-0 mb-4 min-h-full w-full flex-1 flex flex-col">
                {children}
            </div>
            <div className="mb-4 relative bottom-0 w-full pb-1">
                <Footer />
            </div>
        </div>
    );
}
