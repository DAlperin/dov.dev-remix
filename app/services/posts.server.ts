import { getSanityClient } from "~/config/sanity.server";
import type { SanityCategory, SanityPost } from "~/utils/post";
import {tracer} from "../../telemetry";
import { cache } from "~/services/cache.server";

export async function getPosts(limit?: number): Promise<SanityPost[]> {
    return tracer.startActiveSpan("getPosts", async span => {
        if (await cache.redis.exists("posts_all")) {
            const posts = JSON.parse(await cache.redis.get("posts_all"));
            span.end()
            return posts
        }
        const posts = await getSanityClient().fetch(
            `*[_type == 'post'][0...$limit] {
          "cats": categories[]->,
          ...
        } | order(dateTime(publishedAt) desc)`,
            {limit: limit ? limit : 5}
        );
        cache.redis.set("posts_all", JSON.stringify(posts), "EX", 200)
        span.end()
        return posts
    })
}

export async function countPostsPerTag(tag: string): Promise<number> {
    return getSanityClient().fetch(
        `
        count(*[_type == "post" && $cat in categories[]->title] {
          ...,
          "cats": categories[]->,
          categories[] -> {
            title,
            slug
          },
        })`,
        { cat: tag }
    );
}

export async function getCategories(): Promise<SanityCategory[]> {
    return tracer.startActiveSpan("getCategories", span => {
        const cats = getSanityClient().fetch('*[_type == "category"]');
        span.end()
        return cats
    })
}

export async function getPostsByTag(tag: string): Promise<SanityPost[]> {
    return tracer.startActiveSpan("getPostsByTag", span => {
        const posts = getSanityClient().fetch(
            `
        *[_type == "post" && $cat in categories[]->title] {
          ...,
          "cats": categories[]->,
          categories[] -> {
            title,
            slug
          },
        }`,
            {cat: tag}
        );
        span.end()
        return posts
    })
}
