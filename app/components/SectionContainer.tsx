import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default function SectionContainer({ children }: Props): JSX.Element {
    return (
        <div className="max-w-3xl px-4 mx-auto sm:px-6 xl:max-w-5xl xl:px-0">
            {children}
        </div>
    );
}
