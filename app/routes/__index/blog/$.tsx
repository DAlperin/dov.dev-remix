import type { PortableTextReactComponents } from "@portabletext/react";
import { PortableText } from "@portabletext/react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { FitNewsletterForm } from "~/components/NewsletterForm";
import Preview from "~/components/Preview";
import ProgressiveImg from "~/components/ProgressiveImg";
import { sanityClient as frontendSanityClient } from "~/config/sanity";
import { getSanityClient } from "~/config/sanity.server";
import { db } from "~/services/db.server";
import type { SanityCategory, SanityPost } from "~/utils/post";
import { commitSession, getSession } from "~/utils/session.server";

type LoaderData = {
    sanityPosts: SanityPost[];
    query: string | null;
    queryParams: { slug: string } | null;
    hits: number;
    preview: boolean;
};

export const meta: MetaFunction = ({ data }) => {
    return {
        title: data.sanityPosts[0].title,
        // description: data.frontmatter.summary,
        "og:title": data.sanityPosts[0].title,
    };
};

const portableTextMap: Partial<PortableTextReactComponents> = {
    types: {
        image: ({ value }: { value: SanityImageSource }) => {
            const builder = imageUrlBuilder(frontendSanityClient);
            return (
                <div className="mx-auto">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img src={builder.image(value).url()} />
                </div>
            );
        },
        codeBlock: ({ value }) => {
            return (
                <SyntaxHighlighter language={value.language} style={okaidia}>
                    {value.code}
                </SyntaxHighlighter>
            );
        },
        newsletterform: ({ value }) => {
            return <FitNewsletterForm title={value.title} />;
        },
    },
};

export function filterDataToSingleItem(
    data: SanityPost[],
    preview = false
): SanityPost {
    if (!Array.isArray(data)) {
        return data;
    }

    if (data.length === 1) {
        return data[0];
    }

    if (preview) {
        return data.find((item) => item._id.startsWith(`drafts.`)) ?? data[0];
    }

    return data[0];
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const slug = params["*"];
    if (!slug) {
        return new Response("Not found", { status: 404 });
    }

    const requestUrl = new URL(request?.url);

    const preview =
        requestUrl?.searchParams?.get("preview") ===
        process.env.SANITY_PREVIEW_SECRET;

    const query = `*[_type == 'post' && slug.current == $slug] {
          "cats": categories[]->,
          "fullImage": mainImage.asset->,
          ...
        }`;

    const queryParams = {
        slug,
    };

    const sanityPosts = await getSanityClient(preview).fetch(
        query,
        queryParams
    );

    if (sanityPosts.length === 0) {
        throw new Response("Not Found", {
            status: 404,
        });
    }

    const headers: Record<string, string> = {};

    const session = await getSession(request.headers.get("cookie"));

    if (process.env.NODE_ENV === "production" && !session.has(`hit:${slug}`)) {
        await db.postHit.create({
            data: {
                slug,
            },
        });
        session.set(`hit:${slug}`, 1);
        headers["Set-Cookie"] = await commitSession(session);
    }

    const hits = await db.postHit.count({
        where: {
            slug,
        },
    });

    return json(
        {
            sanityPosts,
            preview,
            query: preview ? query : null,
            queryParams: preview ? queryParams : null,
            hits,
        },
        { headers }
    );
};

function PostBody({ loaderData }: { loaderData: LoaderData }): JSX.Element {
    const builder = imageUrlBuilder(frontendSanityClient);
    const [data, setData] = useState(loaderData.sanityPosts);
    const post = filterDataToSingleItem(data, loaderData.preview);
    return (
        <>
            <h1 className="leading-14">{post.title}</h1>
            <div className="flex flex-row">
                <p className="mb-0 flex-1">
                    {post.cats.map((cat: SanityCategory) => {
                        return (
                            <a key={cat.title} href={`/blog/tags/${cat.title}`}>
                                {cat.title} &nbsp;
                            </a>
                        );
                    })}
                </p>
                <p className="mb-0">Hit Counter: {loaderData.hits}</p>
            </div>
            <hr className="mt-3" />
            {loaderData.preview ? (
                <Preview
                    data={data}
                    setData={setData}
                    query={loaderData.query ?? ""}
                    queryParams={loaderData.queryParams ?? {}}
                />
            ) : null}
            {post.mainImage === undefined ? null : (
                <>
                    <ProgressiveImg
                        className="w-full"
                        height={post.fullImage.metadata.dimensions.height}
                        width={post.fullImage.metadata.dimensions.width}
                        placeholderSrc={post.fullImage.metadata.lqip}
                        src={builder.image(post.mainImage).auto("format").url()}
                        alt={post.mainImage.caption}
                    />
                    <figcaption className="text-center mt-2 italic">
                        {post.mainImage.caption}
                    </figcaption>
                </>
            )}
            <PortableText value={post.body} components={portableTextMap} />
        </>
    );
}

export default function Post(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    if (!loaderData) return <p>...loading</p>;
    return <PostBody loaderData={loaderData} />;
}
