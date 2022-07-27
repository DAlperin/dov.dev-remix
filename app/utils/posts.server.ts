import { getSanityClient } from "~/config/sanity.server";
import type { SanityCategory, SanityPost } from "~/utils/post";

export async function getPosts(limit?: number): Promise<SanityPost[]> {
    return getSanityClient().fetch(
        `*[_type == 'post'][0...$limit] {
          "cats": categories[]->,
          ...
        } | order(dateTime(publishedAt) desc)`,
        { limit: limit ? limit : 5 }
    );
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
    return getSanityClient().fetch('*[_type == "category"]');
}

export async function getPostsByTag(tag: string): Promise<SanityPost[]> {
    return getSanityClient().fetch(
        `
        *[_type == "post" && $cat in categories[]->title] {
          ...,
          "cats": categories[]->,
          categories[] -> {
            title,
            slug
          },
        }`,
        { cat: tag }
    );
}
