import type * as esbuild from "esbuild";
import parseFrontMatter from "front-matter";
import type grayMatter from "gray-matter";
import Redis from "ioredis";
import path from "path";

import { readFile, readdir } from "./fs.server";
import { bundleMDX } from "./mdx.server";

export type PageMarkdownAttributes = {
    title: string;
};

type bundledMDX = {
    code: string;
    frontmatter: PageMarkdownAttributes;
    errors: esbuild.Message[];
    matter: Omit<grayMatter.GrayMatterFile<string>, "data"> & {
        data: PageMarkdownAttributes;
    };
};

export async function getPage(slug: string): Promise<bundledMDX | undefined> {
    const redis = new Redis({
        port: 6379,
        host: "127.0.0.1",
    });
    if (await redis.exists(`page:${slug}`)) {
        const cached = await redis.get(`page:${slug}`);
        if (cached) {
            return JSON.parse(cached) as bundledMDX;
        }
    }
    const source = await readFile(
        path.join(`${__dirname}/../content/pages`, `${slug}.mdx`),
        "utf-8"
    );
    const rehypeHighlight = await import("rehype-highlight").then(
        (mod) => mod.default
    );
    const { default: remarkGfm } = await import("remark-gfm");
    const { default: rehypeAutolinkHeadings } = await import(
        "rehype-autolink-headings"
    );

    const { default: rehypeToc } = await import("rehype-toc");
    const { default: rehypeSlug } = await import("rehype-slug");

    const output = await bundleMDX({
        source,
        xdmOptions(options, frontmatter) {
            options.remarkPlugins = [
                ...(options.remarkPlugins ?? []),
                // remarkMdxImages,
                remarkGfm,
                // remarkBreaks,
                // [remarkFootnotes, { inlineNotes: true }],
            ];
            options.rehypePlugins = [
                ...(options.rehypePlugins ?? []),
                rehypeAutolinkHeadings,
                rehypeSlug,
                // rehypeToc,
                [rehypeHighlight, { format: "detect", ignoreMissing: true }],
            ];

            return options;
        },
    }).catch((error) => {
        console.error(error);
        throw error;
    });
    if (output) {
        await redis.set(`page:${slug}`, JSON.stringify(output), "EX", 200);
        return output as bundledMDX;
    }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getPages() {
    const postsPath = await readdir(`${__dirname}/../content/pages`, {
        withFileTypes: true,
    });

    return Promise.all(
        postsPath.map(async (dirent) => {
            const file = await readFile(
                path.join(`${__dirname}/../content/pages`, dirent.name)
            );
            const { attributes } = parseFrontMatter(file.toString());
            return {
                // eslint-disable-next-line require-unicode-regexp
                slug: dirent.name.replace(/\.mdx/, ""),
                // @ts-expect-error TODO: properly type this whole thing
                title: attributes.title,
            };
        })
    );
}
