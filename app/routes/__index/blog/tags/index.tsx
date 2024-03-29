import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
// import { useLoaderData, json } from "superjson-remix";

import { getCategories } from "~/services/posts.server";
import type { SanityCategory } from "~/utils/post";

type LoaderData = {
    tags: SanityCategory[];
};
export const loader: LoaderFunction = async () => {
    const tags = await getCategories();
    return json<LoaderData>({
        tags,
    });
};

export default function Index(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    const tags: JSX.Element[] = [];
    loaderData.tags.forEach((tag) => {
        tags.push(
            <div key={`${tag.title}`}>
                <a href={`/blog/tags/${tag.title}`}>{tag.title}</a>
            </div>
        );
    });

    return (
        <div>
            <h1>Tags</h1>
            <hr />
            <div className="inline-flex space-x-2">
                {tags.map((tag) => {
                    return tag;
                })}
            </div>
        </div>
    );
}
