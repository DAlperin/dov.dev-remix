import { Image } from "remix-image";

type Props = {
    path: string;
    alt: string;
    className?: string;
};

export default function RoundedImage({
    path,
    className,
    alt,
}: Props): JSX.Element {
    return (
        <Image
            src={path}
            alt={alt}
            height="300"
            width="300"
            responsive={[
                {
                    size: {
                        width: 300,
                        height: 300,
                    },
                },
            ]}
            options={{
                fit: "cover",
            }}
            className={`rounded-full ${className ?? ""}`}
        />
    );
}
