import type { Transformer } from "remix-image";
import { MimeType } from "remix-image";
import sharp from "sharp";

const supportedInputs = new Set([
    MimeType.JPEG,
    MimeType.PNG,
    MimeType.WEBP,
    MimeType.TIFF,
]);

const supportedOutputs = new Set([MimeType.JPEG, MimeType.PNG, MimeType.WEBP]);

export const sharpTransformer: Transformer = {
    name: "sharpTransformer",
    supportedInputs,
    supportedOutputs,
    fallbackOutput: MimeType.PNG,
    transform: async (
        { data },
        { width, height, fit, position, quality, compressionLevel }
    ) => {
        const image = sharp(data);

        image
            .resize(width, height, {
                fit,
                position,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .jpeg({
                quality,
                progressive: true,
                // force: outputContentType === MimeType.JPEG,
            })
            .png({
                progressive: true,
                compressionLevel,
                // force: outputContentType === MimeType.PNG,
            })
            .webp({
                quality,
                // force: outputContentType === MimeType.WEBP,
            })
            .tiff({
                quality,
                force: false,
            })
            .toFormat("webp");

        return image.toBuffer();
    },
};
