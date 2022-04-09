// eslint-disable-next-line import/no-namespace
import type * as esbuild from "esbuild";
import parseFrontMatter from "front-matter";
import fsExists from "fs.promises.exists"
import type grayMatter from "gray-matter";
import path from "path";

import { readFile, readdir } from "./fs.server";
import { bundleMDX } from "./mdx.server";
import { cache } from "~/services/cache.server";

export type PostMarkdownAttributes = {
    slug: string;
    title: string;
    tags: string[];
    date: string;
};

type bundledMDX = {
    code: string;
    frontmatter: PostMarkdownAttributes;
    errors: esbuild.Message[];
    matter: Omit<grayMatter.GrayMatterFile<string>, "data"> & {
        data: PostMarkdownAttributes;
    };
};

export async function getPost(postPath: string, slug: string): Promise<bundledMDX | undefined> {
    if (await cache.redis.exists(`post:${slug}`)) {
        const cached = await cache.redis.get(`post:${slug}`);
        if (cached) {
            return JSON.parse(cached) as bundledMDX;
        }
    }
    if (!await fsExists(postPath)) {
        return undefined
    }
    const source = await readFile(
        postPath,
        "utf-8"
    );

    const { default: rehypePrismPlus } = await import("rehype-prism-plus")
    const { default: remarkGfm } = await import("remark-gfm");
    const { default: rehypeAutolinkHeadings } = await import(
        "rehype-autolink-headings"
    );

    const { default: rehypeSlug } = await import("rehype-slug");

    const { default: rehypeRaw } = await import("rehype-raw");

    const { default: remarkToc } = await import("remark-toc");

    const { default: remarkCollapse } = await import("remark-collapse")

    const { nodeTypes } = await import("@mdx-js/mdx")

    const output = await bundleMDX({
        source,
        mdxOptions(options) {
            options.remarkPlugins = [
                ...(options.remarkPlugins ?? []),
                remarkGfm,
                remarkToc,
                [remarkCollapse, {
                    test: "Table of contents", summary: () => {
                        return "Click to open"
                    }
                }]
            ];
            options.rehypePlugins = [
                [rehypeRaw, { passThrough: nodeTypes }],
                ...(options.rehypePlugins ?? []),
                rehypeAutolinkHeadings,
                rehypeSlug,
                rehypePrismPlus
            ];

            return options;
        },
        globals: { "BlogNewsletterForm": "BlogNewsletterForm" }
    }).catch((error) => {
        throw error;
    });
    if (output) {
        await cache.redis.set(`post:${slug}`, JSON.stringify(output), "EX", 200);
        return output as unknown as bundledMDX;
    }
}

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function getPrettyDate(date: string): string {
    const theDate = new Date(date)
    const month = monthNames[theDate.getMonth()]
    // TODO: there is probably a way to do this with toLocaleString but I don't really want to read that much MDN right now
    return `${month} ${theDate.getDay()}, ${theDate.getFullYear()}`
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getPosts() {
    const postsPath = await readdir(`${__dirname}/../content/posts`, {
        withFileTypes: true,
    });

    return Promise.all(
        postsPath.map(async (dirent) => {
            const fileName = path.join(`${__dirname}/../content/posts`, dirent.name)
            const file = await readFile(fileName);
            const frontMatter = parseFrontMatter(file.toString());
            const attributes = frontMatter.attributes as PostMarkdownAttributes
            return {
                ...attributes,
                fileName
            };
        })
    );
}

export async function countTags(): Promise<Record<string, number>> {
    const count: Record<string, number> = {}
    const posts = await getPosts()
    // FIXME: this lies on the heavy assumption that I won't mess up and add multiple of the same tag to one post
    for (const post of posts) {
        for (const tag of post.tags) {
            if (tag in count) count[tag] += 1
            else count[tag] = 1
        }
    }
    return count
}

export async function getPostsByTag(tag: string): Promise<(bundledMDX | undefined)[]> {
    const posts = await getPosts()
    const postsWithTag: Promise<bundledMDX | undefined>[] = []
    for (const post of posts) {
        if (post.tags.includes(tag)) postsWithTag.push(getPost(post.fileName, post.slug))
    }
    return Promise.all(postsWithTag)
}

export async function getPostBySlug(slug: string): Promise<bundledMDX | undefined> {
    const posts = await getPosts()
    for (const post of posts) {
        if (post.slug === slug) return getPost(post.fileName, slug)
    }
}