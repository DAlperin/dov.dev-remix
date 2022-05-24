import type { Message } from "esbuild";
import parseFrontMatter from "front-matter";
import fsExists from "fs.promises.exists";
import type grayMatter from "gray-matter";
import { bundleMDX } from "mdx-bundler";
import path from "path";

import { readFile, readdir } from "./fs.server";
import { cache } from "~/services/cache.server";

export type PostMarkdownAttributes = {
    slug: string;
    title: string;
    tags: string[];
    date: string;
    summary: string;
    draft: boolean;
};

type bundledMDX = {
    code: string;
    frontmatter: PostMarkdownAttributes;
    errors: Message[];
    matter: Omit<grayMatter.GrayMatterFile<string>, "data"> & {
        data: PostMarkdownAttributes;
    };
};

export async function getPost(
    postPath: string,
    slug: string,
    noCache = false
): Promise<bundledMDX | undefined> {
    const shard = process.env.FLY_REGION ?? "main";
    if (!noCache && (await cache.redis.exists(`post:${slug}:${shard}`))) {
        const cached = await cache.redis.get(`post:${slug}:${shard}`);
        if (cached) {
            return JSON.parse(cached) as bundledMDX;
        }
    }
    if (!(await fsExists(postPath))) {
        return undefined;
    }
    const source = await readFile(postPath, "utf-8");

    const { default: rehypePrismPlus } = await import("rehype-prism-plus");
    const { default: remarkGfm } = await import("remark-gfm");
    const { default: rehypeAutolinkHeadings } = await import(
        "rehype-autolink-headings"
    );
    const { default: rehypeSlug } = await import("rehype-slug");
    const { default: rehypeRaw } = await import("rehype-raw");
    const { default: remarkToc } = await import("remark-toc");
    const { nodeTypes } = await import("@mdx-js/mdx");
    const { default: rehypeRemoveEmptyParagraph } = await import(
        "rehype-remove-empty-paragraph"
    );
    const { default: remarkCollapse } = await import("remark-collapse");

    const output = await bundleMDX({
        source,
        mdxOptions(options) {
            options.remarkPlugins = [
                ...(options.remarkPlugins ?? []),
                remarkGfm,
                remarkToc,
                [
                    remarkCollapse,
                    {
                        test: "Table of contents",
                        summary: () => {
                            return "Click to open";
                        },
                    },
                ],
            ];
            options.rehypePlugins = [
                rehypePrismPlus,
                [rehypeRaw, { passThrough: nodeTypes }],
                ...(options.rehypePlugins ?? []),
                rehypeAutolinkHeadings,
                rehypeSlug,
                rehypeRemoveEmptyParagraph,
            ];

            return options;
        },
        globals: { BlogNewsletterForm: "BlogNewsletterForm" },
    }).catch((error) => {
        throw error;
    });
    if (output) {
        await cache.redis.set(
            `post:${slug}:${shard}`,
            JSON.stringify(output),
            "EX",
            200
        );
        if (
            (output.frontmatter as PostMarkdownAttributes).draft &&
            process.env.NODE_ENV !== "development"
        )
            return undefined;
        return output as unknown as bundledMDX;
    }
}

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export function getPrettyDate(date: string): string {
    const theDate = new Date(date);
    const month = monthNames[theDate.getMonth()];
    // TODO: there is probably a way to do this with toLocaleString but I don't really want to read that much MDN right now
    return `${month} ${theDate.getDate() + 1}, ${theDate.getFullYear()}`;
}
export type postItem = {
    prettyDate: string;
    fileName: string;
} & PostMarkdownAttributes;

export async function getPosts(limit?: number): Promise<postItem[]> {
    const postsPath = await readdir(`${__dirname}/../content/posts`, {
        withFileTypes: true,
    });

    const unsortedPostsDirent = limit ? postsPath.slice(0, limit) : postsPath;

    const unsortedPosts = await Promise.all(
        unsortedPostsDirent.map(async (dirent) => {
            const fileName = path.join(
                `${__dirname}/../content/posts`,
                dirent.name
            );
            const file = await readFile(fileName);
            const frontMatter = parseFrontMatter(file.toString());
            const attributes = frontMatter.attributes as PostMarkdownAttributes;
            return {
                ...attributes,
                prettyDate: getPrettyDate(attributes.date),
                fileName,
            };
        })
    );

    const currentPosts = unsortedPosts.filter((post) => {
        return !(post.draft && process.env.NODE_ENV !== "development");
    });

    return currentPosts.sort((a, b) => {
        // @ts-expect-error dates suck
        return new Date(b.date) - new Date(a.date);
    });
}

export async function countTags(): Promise<Map<string, number>> {
    const count: Map<string, number> = new Map<string, number>();
    const posts = await getPosts();
    // FIXME: this lies on the heavy assumption that I won't mess up and add multiple of the same tag to one post
    for (const post of posts) {
        if (shouldIncludePost(post)) {
            for (const tag of post.tags) {
                const current = count.get(tag);
                if (current) {
                    count.set(tag, current + 1);
                } else {
                    count.set(tag, 1);
                }
            }
        }
    }
    return count;
}

function shouldIncludePost(post: postItem): boolean {
    return !(post.draft && process.env.NODE_ENV !== "development");
}

export async function getPostsByTag(
    tag: string
): Promise<(postItem | undefined)[]> {
    const posts = await getPosts();
    const postsWithTag: (postItem | undefined)[] = [];
    for (const post of posts) {
        if (post.tags.includes(tag) && shouldIncludePost(post)) {
            postsWithTag.push(post);
        }
    }
    return postsWithTag;
}

export async function getPostBySlug(
    slug: string,
    noCache = false
): Promise<bundledMDX | undefined> {
    const posts = await getPosts();
    for (const post of posts) {
        if (post.slug === slug && shouldIncludePost(post))
            return getPost(post.fileName, slug, noCache);
    }
}
