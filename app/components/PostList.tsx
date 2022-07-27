import PostCard from "./PostCard";
import type { SanityPost } from "~/utils/post";

type Props = {
    posts: SanityPost[];
};

export default function PostList({ posts }: Props): JSX.Element {
    return (
        <>
            {posts.map((post) => {
                return <PostCard post={post} key={post.slug.current} />;
            })}
        </>
    );
}
