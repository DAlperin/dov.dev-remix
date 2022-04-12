type Props = {
    children?: React.ReactNode;
    className?: string;
    contentClassName?: string;
};

export default function DashboardCard({
    children,
    className,
    contentClassName,
}: Props): JSX.Element {
    return (
        <div className={`${className ?? ""}`}>
            <div className={`${contentClassName ?? ""}`}>{children}</div>
        </div>
    );
}
