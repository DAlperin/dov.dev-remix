import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";
import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";

import { BlogNewsletterForm } from "~/components/NewsletterForm";
import type { PostMarkdownAttributes } from "~/utils/posts.server";
import { getPrettyDate, getPostBySlug } from "~/utils/posts.server";

type LoaderData = {
    frontmatter: PostMarkdownAttributes;
    code: string;
};

export const loader: LoaderFunction = async ({ params }) => {
    const slug = params["*"];
    if (!slug) {
        return new Response("Not found", { status: 404 });
    }

    const post = await getPostBySlug(slug);
    if (!post) {
        throw new Response("Not Found", {
            status: 404,
        });
    }
    const { frontmatter, code } = post;
    const fancyDate = getPrettyDate(frontmatter.date);
    frontmatter.date = fancyDate;
    return json({ code, frontmatter });
};

function PostBody({ loaderData }: { loaderData: LoaderData }): JSX.Element {
    const Component = useMemo(
        () =>
            getMDXComponent(loaderData.code, {
                BlogNewsletterForm,
            }),
        [loaderData.code]
    );

    return (
        <>
            <h1 className="leading-14">{loaderData.frontmatter.title}</h1>
            <hr />
            <Component />
        </>
    );
}

export default function Post(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    if (!loaderData || !loaderData.code || !loaderData.frontmatter)
        return <p>...loading</p>;
    return <PostBody loaderData={loaderData} />;
}
