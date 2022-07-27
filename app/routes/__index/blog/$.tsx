import type { PortableTextReactComponents } from "@portabletext/react";
import { PortableText } from "@portabletext/react";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/cjs/styles/prism";

import { FitNewsletterForm } from "~/components/NewsletterForm";
import { getSanityClient } from "~/config/sanity";
import { db } from "~/services/db.server";
import type { SanityCategory, SanityPost } from "~/utils/post";
import { commitSession, getSession } from "~/utils/session.server";

type LoaderData = {
    sanityPost: SanityPost;
    hits: number;
};

export const meta: MetaFunction = ({ data }) => {
    return {
        title: data.title,
        // description: data.frontmatter.summary,
        "og:title": data.title,
    };
};

const portableTextMap: Partial<PortableTextReactComponents> = {
    types: {
        image: ({ value }: { value: SanityImageSource }) => {
            const builder = imageUrlBuilder(getSanityClient());
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

export const loader: LoaderFunction = async ({ params, request }) => {
    const slug = params["*"];
    if (!slug) {
        return new Response("Not found", { status: 404 });
    }

    const sanityPosts = await getSanityClient().fetch(
        `*[_type == 'post' && slug.current == $slug] {
          "cats": categories[]->,
          ...
        }`,
        {
            slug,
        }
    );

    if (sanityPosts.length === 0) {
        throw new Response("Not Found", {
            status: 404,
        });
    }

    const sanityPost = sanityPosts[0];

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

    return json({ sanityPost, hits }, { headers });
};

function PostBody({ loaderData }: { loaderData: LoaderData }): JSX.Element {
    return (
        <>
            <h1 className="leading-14">{loaderData.sanityPost.title}</h1>
            <div className="flex flex-row">
                <p className="mb-0 flex-1">
                    {loaderData.sanityPost.cats.map((cat: SanityCategory) => {
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
            <PortableText
                value={loaderData.sanityPost.body}
                components={portableTextMap}
            />
        </>
    );
}

export default function Post(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    if (!loaderData) return <p>...loading</p>;
    return <PostBody loaderData={loaderData} />;
}
