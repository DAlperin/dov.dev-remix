import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";

import { getGhSponsors } from "~/services/gh.server";

type LoaderData = {
    sponsors: {
        node: { id: string; name: string; url: string; avatarUrl: string };
    }[];
};

export const loader: LoaderFunction = async () => {
    return {
        sponsors: await getGhSponsors(),
    };
};

export default function Thanks(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    return (
        <>
            <h1 className="mb-5">Thank you to my sponsors on github</h1>
            <ul>
                {loaderData.sponsors.map((sponsor) => {
                    return (
                        <li key={sponsor.node.id} className="list-none">
                            <img
                                className="rounded-full h-10 w-10 inline mr-2"
                                alt={`${sponsor.node.name}s profile picture`}
                                src={sponsor.node.avatarUrl}
                            />
                            <span className="font-bold">
                                <a href={sponsor.node.url}>
                                    {sponsor.node.name}
                                </a>
                            </span>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
