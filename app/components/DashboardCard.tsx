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
            <div
                className={`bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 w-full ${
                    contentClassName ?? ""
                }`}
            >
                {children}
            </div>
        </div>
    );
}
