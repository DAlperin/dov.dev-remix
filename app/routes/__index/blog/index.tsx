import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import PostList from "~/components/PostList";
import type { postItem } from "~/utils/posts.server";
import { getPosts } from "~/utils/posts.server";

type LoaderData = {
    posts: postItem[];
};

export const loader: LoaderFunction = async () => {
    const posts = await getPosts();
    return json<LoaderData>({
        posts,
    });
};

export default function Index(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    return (
        <div>
            <h1>Posts</h1>
            <hr />
            <PostList posts={loaderData.posts} />
        </div>
    );
}
