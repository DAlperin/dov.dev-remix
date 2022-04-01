import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";
import type { LoaderFunction } from "remix";
import { json, useLoaderData, useParams } from "remix";

import Split from "~/components/Split";
import { getPage } from "~/utils/pages.server";

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
    if (!post) {
        throw new Response("Not Found", {
            status: 404,
        });
    }
    const { frontmatter, code } = post;
    return json({ code, frontmatter });
};

export function CatchBoundary(): JSX.Element {
    const params = useParams();
    const slug = params["*"];
    return (
        <div>
            <h2>We couldn't find that page!</h2>
            <h4>
                We couldnt find <em>{slug}</em> if you think it should be here
                contact us dov@dov.dev
            </h4>
        </div>
    );
}

export function ErrorBoundary(): JSX.Element {
    return (
        <div>
            <h2>500</h2>
            <h4>
                Something went wrong. This probably isn't your fault. Try again
                later.
            </h4>
        </div>
    );
}

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
