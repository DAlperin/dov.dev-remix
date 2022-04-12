import PostCard from "./PostCard";
import type { postItem } from "~/utils/posts.server";

type Props = {
    posts: postItem[];
};

export default function PostList({ posts }: Props): JSX.Element {
    return (
        <>
            {posts.map((post) => {
                return <PostCard post={post} key={post.slug} />;
            })}
        </>
    );
}
