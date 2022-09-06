import type {PortableTextReactComponents} from "@portabletext/react";
import {PortableText} from "@portabletext/react";
import {useLoaderData} from "@remix-run/react";
import type {LoaderFunction, MetaFunction} from "@remix-run/server-runtime";
import {json} from "@remix-run/server-runtime";
import imageUrlBuilder from "@sanity/image-url";
import type {SanityImageSource} from "@sanity/image-url/lib/types/types";
import {useEffect, useState} from "react";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {okaidia, prism} from "react-syntax-highlighter/dist/cjs/styles/prism";
import {Theme, useTheme} from "remix-themes";

import {FitNewsletterForm} from "~/components/NewsletterForm";
import Preview from "~/components/Preview";
import ProgressiveImg from "~/components/ProgressiveImg";
import {sanityClient as frontendSanityClient} from "~/config/sanity";
import {getSanityClient} from "~/config/sanity.server";
import {themeSessionResolver} from "~/root";
import {db} from "~/services/db.server";
import type {SanityCategory, SanityPost} from "~/utils/post";
import {commitSession, getSession} from "~/utils/session.server";
import {cache} from "~/services/cache.server";

type LoaderData = {
    sanityPosts: SanityPost[];
    query: string | null;
    queryParams: { slug: string } | null;
    hits: number;
    preview: boolean;
};

export const meta: MetaFunction = ({ data }: {data: LoaderData}) => {
    const builder = imageUrlBuilder(frontendSanityClient);
    return {
        title: data.sanityPosts[0].title,
        description: data.sanityPosts[0].description,
        keywords: data.sanityPosts[0].cats.map(keyword => keyword.title).join(","),
        "og:title": data.sanityPosts[0].title,
        "og:description": data.sanityPosts[0].description,
        "og:image": builder.image(data.sanityPosts[0].mainImage).auto("format").url()
    };
};


const buildPre = (code: string) => {
    return ({ children }: {children: JSX.Element}) => <pre className="blog-pre">
        <CodeCopyBtn code={code}/>
        {children}
    </pre>
}

function CodeCopyBtn({ code }: {code: string}) {
    const [copyOk, setCopyOk] = useState(false);

    const iconColor = copyOk ? '#0af20a' : '#ddd';

    const handleClick = async () => {
        await navigator.clipboard.writeText(code)
        setCopyOk(true)
        setTimeout(() => {
            setCopyOk(false);
        }, 500);
    }

    return (
        <div className="code-copy-btn">
            <button type="button" onClick={handleClick} className="text-lg mt-3 mr-3" style={{color: iconColor}}>Copy</button>
        </div>
    )
}

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
        codeBlock: function CodeBlock ({ value }) {
            const [mounted, setMounted] = useState(false)
            const [theme] = useTheme()

            useEffect(() => {
                setMounted(true)
            }, [])

            if (!mounted) {
                return <pre><code>{value.code}</code></pre>
            }

            return (
                <SyntaxHighlighter language={value.language} style={theme === Theme.DARK ? okaidia : prism} PreTag={buildPre(value.code)}>
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
    const { getTheme } = await themeSessionResolver(request);
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

    let sanityPosts

    if (await cache.redis.exists(`post:${slug}`) && !preview) {
       sanityPosts = JSON.parse(await cache.redis.get(`post:${slug}`))
    } else {
        sanityPosts = await getSanityClient(preview).fetch(
            query,
            queryParams
        );
        cache.redis.set(`post:${slug}`, JSON.stringify(sanityPosts), "EX", 200)
    }

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
            theme: getTheme()
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
