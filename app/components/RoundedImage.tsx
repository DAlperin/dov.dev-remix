import { Image, ImageFit } from "remix-image";

type Props = {
    path: string;
    className?: string;
};

export default function RoundedImage({ path, className }: Props): JSX.Element {
    return (
        <Image
            src={path}
            responsive={[
                {
                    size: {
                        width: 300,
                        height: 300,
                    },
                },
            ]}
            options={{
                fit: ImageFit.COVER,
            }}
            className={`rounded-full ${className ?? ""}`}
        />
    );
}
