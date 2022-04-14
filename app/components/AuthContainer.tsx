import type { ReactElement } from "react";

type Props = {
    children: ReactElement;
};
export default function AuthContainer({ children }: Props): JSX.Element {
    return (
        <div
            className="max-w-lg px-10 py-8 bg-slate-300 dark:bg-gray-800 rounded-lg shadow-xl w-full mb-20"
            style={{ overflow: "hidden" }}
        >
            {children}
        </div>
    );
}
