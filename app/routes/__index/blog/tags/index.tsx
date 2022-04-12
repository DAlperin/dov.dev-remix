import type { LoaderFunction } from "@remix-run/server-runtime";
import { useLoaderData, json } from "superjson-remix";

import { countTags } from "~/utils/posts.server";

type LoaderData = {
    tags: Map<string, number>;
};
export const loader: LoaderFunction = async () => {
    const tags = await countTags();
    return json<LoaderData>({
        tags,
    });
};

export default function Index(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    const tags: JSX.Element[] = [];
    loaderData.tags.forEach((count, tag) => {
        tags.push(
            <div key={tag}>
                <a href={`/blog/tags/${tag}`}>{tag}</a>({count})
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
