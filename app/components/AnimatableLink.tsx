import { Link } from "@remix-run/react";
import type { CSSProperties, ReactElement } from "react";

type Props = {
    to: string;
    children: ReactElement | string;
    style?: CSSProperties;
    className?: string;
};
export default function AnimatableLink({
    to,
    children,
    style,
    className,
}: Props): JSX.Element {
    return (
        <Link
            to={to}
            style={{
                display: "inline-block",
                ...style,
            }}
            className={className}
        >
            {children}
        </Link>
    );
}
