import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { getMDXComponent } from "mdx-bundler/client";
import { useMemo } from "react";

import { BlogNewsletterForm } from "~/components/NewsletterForm";
import { db } from "~/services/db.server";
import type { PostMarkdownAttributes } from "~/utils/posts.server";
import { getPrettyDate, getPostBySlug } from "~/utils/posts.server";
import { commitSession, getSession } from "~/utils/session.server";

type LoaderData = {
    frontmatter: PostMarkdownAttributes;
    code: string;
    hits: number;
};

export const meta: MetaFunction = ({ data }) => {
    return {
        title: data.frontmatter.title,
        description: data.frontmatter.summary,
        "og:title": data.frontmatter.title,
    };
};

export const loader: LoaderFunction = async ({ params, request }) => {
    const slug = params["*"];
    if (!slug) {
        return new Response("Not found", { status: 404 });
    }
    const noCache = !!new URL(request.url).searchParams.has("noCache");

    const headers: Record<string, string> = {};

    const post = await getPostBySlug(slug, noCache);
    if (!post) {
        throw new Response("Not Found", {
            status: 404,
        });
    }
    const { frontmatter, code } = post;
    const fancyDate = getPrettyDate(frontmatter.date);
    frontmatter.date = fancyDate;

    const session = await getSession(request.headers.get("cookie"));
    if (Object.keys(session.data).length === 0) {
        headers["Set-Cookie"] = await commitSession(session);
    }
    if (!session.has(`hit:${slug}`)) {
        await db.postHit.create({
            data: {
                slug,
            },
        });
        session.set(`hit:${slug}`, 1);
        await commitSession(session);
    }

    const hits = await db.postHit.count({
        where: {
            slug,
        },
    });
    return json({ code, frontmatter, hits }, { headers });
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
            <div className="flex flex-row">
                <p className="mb-0 flex-1">
                    {loaderData.frontmatter.tags.map((tag) => {
                        return (
                            <a key={tag} href={`/blog/tags/${tag}`}>
                                {tag} &nbsp;
                            </a>
                        );
                    })}
                </p>
                <p className="mb-0">Hit Counter: {loaderData.hits}</p>
            </div>
            <hr className="mt-3" />
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
