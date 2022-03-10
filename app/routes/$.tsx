import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";
import type { LoaderFunction } from "remix";
import { json, useLoaderData } from "remix";

import Split from "~/components/Split";
import { getPage } from "~/utils/pages";

type PageFrontmatter = {
    title: string;
};

type LoaderData = {
    frontmatter: PageFrontmatter;
    code: string;
};

export const loader: LoaderFunction = async ({ params }) => {
    const slug = params["*"];
    if (!slug) {
        return new Response("Not found", { status: 404 });
    }

    const post = await getPage(slug);
    if (post) {
        const { frontmatter, code } = post;
        return json({ frontmatter, code });
    }
    return new Response("Not found", { status: 404 });
};

export default function Post(): JSX.Element {
    const { code, frontmatter } = useLoaderData<LoaderData>();
    const Component = useMemo(
        () =>
            getMDXComponent(code, {
                Split,
            }),
        [code]
    );

    return (
        <>
            <h1>{frontmatter.title}</h1>
            <hr />
            <Component />
        </>
    );
}
