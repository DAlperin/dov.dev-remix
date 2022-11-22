import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";

import { assertedEnvVar, resolveTxt } from "~/utils/environment.server";

 async function txtLookup(name: string) {
  return new Promise<string[][]>((resolve, reject) => {
    resolveTxt(name, (err, records) => {
      if (err) {
        reject(err);
      } else {
        resolve(records);
      }
    });
  });
}

export async function loader() {
    let region = "developement";
    const baseHost = assertedEnvVar("REDIS_HOST");
    let redisHost = baseHost;
    let commitSha = "dev";
    const rawRegions = await txtLookup("regions.dovdotdev.internal")
    const regions = rawRegions[0][0].split(",")
    if (process.env.NODE_ENV === "production") {
        region = assertedEnvVar("FLY_REGION");
        redisHost = `${region}.${baseHost}`;
        commitSha = assertedEnvVar("COMMIT_SHA");
    }
    return {
        region,
        redisHost,
        commitSha,
        regions,
    };
};

export default function Debug(): JSX.Element {
    const data = useLoaderData<typeof loader>();
    return (
        <div>
            <p>Current region: {data.region}</p>
            <p>Current redis cache: {data.redisHost}</p>
            <p>Revision: {data.commitSha}</p>
            <h3>App regions:</h3>
            <ul>
                {data.regions.map(region => {
                    return <li key={region}><a href={`/?forceRegion=${region}`}>{region}</a></li>
                })}
            </ul>
        </div>
    );
}
