import type { TypedObject } from "@portabletext/types";

export type SanityPost = {
    title: string;
    cats: SanityCategory[];
    body: TypedObject | TypedObject[];
    slug: {
        current: string;
    };
    publishedAt: string;
    description: string;
};

export type SanityCategory = {
    title: string;
};

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
