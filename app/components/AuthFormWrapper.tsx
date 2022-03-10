type Props = {
    children: React.ReactElement | null;
};

export default function AuthFormWrapper({ children }: Props): JSX.Element {
    return <div className="h-full w-full">{children}</div>;
}
