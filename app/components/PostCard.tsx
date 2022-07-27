import { Link } from "@remix-run/react";

import type { SanityPost } from "~/utils/post";
import { getPrettyDate } from "~/utils/post";

type Props = {
    post: SanityPost;
};

export default function PostCard({ post }: Props): JSX.Element {
    return (
        <div className="flex flex-col md:flex-row">
            <div className="basis-1/5 mt-1">
                <li className="ml-0">{getPrettyDate(post.publishedAt)}</li>
            </div>
            <div className="flex-1">
                <Link to={`/blog/${post.slug.current}`}>
                    <h3 className="leading-8">{post.title}</h3>
                </Link>
                <p className="mt-0">
                    {post.cats.map((cat) => {
                        return (
                            <a key={cat.title} href={`/blog/tags/${cat.title}`}>
                                {cat.title} &nbsp;
                            </a>
                        );
                    })}
                </p>
                <p className="light:text-gray-600 dark:text-gray-300">
                    {post.description}
                </p>
            </div>
        </div>
    );
}
