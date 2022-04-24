import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";

import { assertedEnvVar } from "~/utils/environment.server";

export const loader: LoaderFunction = () => {
    let region = "developement";
    const baseHost = assertedEnvVar("REDIS_HOST");
    let redisHost = baseHost;
    if (process.env.NODE_ENV === "production") {
        region = assertedEnvVar("FLY_REGION");
        redisHost = `${region}.${baseHost}`;
    }
    return {
        region,
        redisHost,
    };
};

export default function Debug(): JSX.Element {
    const data = useLoaderData();
    return (
        <div>
            <p>Current region: {data.region}</p>
            <p>Current redis cache: {data.redisHost}</p>
        </div>
    );
}
