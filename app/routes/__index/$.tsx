import { useLoaderData, useParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

import Split from "~/components/Split";
import { getPage } from "~/utils/pages.server";

type PageFrontmatter = {
    title: string;
};

type LoaderData = {
    frontmatter: PageFrontmatter;
    code: string;
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

function PageBody({ loaderData }: { loaderData: LoaderData }): JSX.Element {
    const Component = useMemo(
        () =>
            getMDXComponent(loaderData.code, {
                Split,
            }),
        [loaderData.code]
    );

    return (
        <>
            <h1>{loaderData.frontmatter.title}</h1>
            <hr />
            <Component />
        </>
    );
}

export default function Post(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    if (!loaderData || !loaderData.code || !loaderData.frontmatter)
        return <p>Loading...</p>;
    return <PageBody loaderData={loaderData} />;
}
