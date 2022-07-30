import React, { useEffect, useState } from "react";

export default function ProgressiveImg({
    placeholderSrc,
    src,
    alt,
    ...props
}: {
    placeholderSrc: string;
    src: string;
    alt: string;
    [x: string]: unknown;
}): JSX.Element {
    const [imgSrc, setImgSrc] = useState(placeholderSrc || src);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.addEventListener("load", () => {
            setImgSrc(src);
        });
    }, [src]);

    return <img {...{ src: imgSrc, ...props }} alt={alt || ""} />;
}
