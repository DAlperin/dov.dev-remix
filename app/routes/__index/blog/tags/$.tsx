import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";

import PostList from "~/components/PostList";
import { getPostsByTag } from "~/services/posts.server";
import { empty } from "~/utils/array";
import type { SanityPost } from "~/utils/post";

type LoaderData = {
    posts: SanityPost[];
    tag: string;
};

export const loader: LoaderFunction = async ({ params }) => {
    const tag = params["*"];
    if (!tag) {
        return new Response("Not found", { status: 404 });
    }

    const posts = await getPostsByTag(tag);

    return {
        tag,
        posts,
    };
};

export default function Posts(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    return (
        <div>
            <h1>Posts for tag: {loaderData.tag}</h1>
            <hr />
            {empty(loaderData.posts) ? (
                <p>No posts match this tag</p>
            ) : (
                <PostList posts={loaderData.posts as SanityPost[]} />
            )}
        </div>
    );
}
