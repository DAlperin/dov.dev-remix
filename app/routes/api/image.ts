import type { LoaderFunction } from "@remix-run/server-runtime";
import type { Resolver } from "remix-image/server";
import { imageLoader, fsResolver, fetchResolver } from "remix-image/server";

import { S3Cache } from "~/utils/s3imagecache.server";
import { sharpTransformer } from "~/utils/sharp.server";

export const fetchImage: Resolver = async (asset, url, options, basePath) => {
    if (url.startsWith("/") && (url.length === 1 || url[1] !== "/")) {
        return fsResolver(asset, url, options, basePath);
    }
    return fetchResolver(asset, url, options, basePath);
};

const config = {
    selfUrl:
        process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "http://localhost:8080",
    cache: new S3Cache({
        bucketName: "dovdotdevimagecache",
        tbd: 0,
        ttl: 10 * 1000,
    }),
    resolver: fetchImage,
    transformer: sharpTransformer,
};

export const loader: LoaderFunction = ({ request }) => {
    return imageLoader(config, request);
};
