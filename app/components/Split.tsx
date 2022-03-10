import React from "react";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};
export default function Split({ children }: Props): JSX.Element {
    const [first, ...rest] = React.Children.toArray(children);

    return (
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
            <div className="flex flex-col items-center pt-8 space-x-2">
                {first}
            </div>
            <div className="pt-8 pb-8 prose dark:prose-dark max-w-none xl:col-span-2">
                {rest}
            </div>
        </div>
    );
}
