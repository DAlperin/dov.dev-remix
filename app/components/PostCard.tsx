import { Link } from "@remix-run/react";

import type { postItem } from "~/utils/posts.server";

type Props = {
    post: postItem;
};

export default function PostCard({ post }: Props): JSX.Element {
    return (
        <div className="flex flex-col md:flex-row">
            <div className="mr-0 md:mr-40 mt-1">
                <li className="ml-0">{post.prettyDate}</li>
            </div>
            <div className="flex-1">
                <Link to={`/blog/${post.slug}`}>
                    <h3 className="leading-8">{post.title}</h3>
                </Link>
                <p className="mt-0">
                    {post.tags.map((tag) => {
                        return (
                            <a key={tag} href={`/blog/tags/${tag}`}>
                                {tag} &nbsp;
                            </a>
                        );
                    })}
                </p>
                <p className="light:text-gray-600 dark:text-gray-300">
                    {post.summary}
                </p>
            </div>
        </div>
    );
}
