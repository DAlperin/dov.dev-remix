import type { ReactNode } from "react";

import Footer from "./Footer";

type Props = {
    children: ReactNode;
    fullWidth?: boolean;
    region?: string;
    time?: string;
};

export default function SectionContainer({
    children,
    fullWidth = false,
    region,
    time,
}: Props): JSX.Element {
    return (
        <div className="flex flex-col min-h-screen min-w-full">
            <div
                className={`${
                    fullWidth ? "max-w-7xl" : "max-w-3xl xl:max-w-5xl"
                } px-4 mx-auto sm:px-6 xl:px-0 mb-4 min-h-full w-full flex-1 flex flex-col`}
            >
                {children}
            </div>
            <div className="mb-2 relative bottom-0 w-full pb-1">
                <Footer region={region} time={time} />
            </div>
        </div>
    );
}
