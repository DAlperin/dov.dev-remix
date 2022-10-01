import type { User } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import type {
    LinksFunction,
    LoaderArgs,
    LoaderFunction,
} from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import Image from "remix-image";

import { FitNewsletterForm } from "~/components/NewsletterForm";
import PostList from "~/components/PostList";
import { isAuthenticated } from "~/services/auth.server";
import { getPosts } from "~/services/posts.server";
import styles from "~/styles/index.css";
import type { SanityPost } from "~/utils/post";

type LoaderData = {
    user: false | User;
    posts: SanityPost[];
};

export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: styles }];
};

export async function loader({ request }: LoaderArgs) {
    return json<LoaderData>({
        user: await isAuthenticated(request),
        posts: await getPosts(5),
    });
}

export default function Index(): JSX.Element {
    const loaderData = useLoaderData<typeof loader>();
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
                hi! 👋 nice to meet you
            </h1>
            <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
                i'm dov{" "}
                <i className="font-normal dark:text-gray-400 text-gray-800">
                    {loaderData?.user
                        ? `and you are ${loaderData.user.name}`
                        : null}
                </i>
            </h1>
            <div className="pb-0.5 md:pb-8 flex flex-col md:flex-row">
                <div className="basis-3/4">
                    <Image
                        src="/static/headshot.png"
                        alt="Dov Alperin headshot"
                        style={{
                            marginLeft: "auto",
                            marginRight: "auto",
                        }}
                        height="400"
                        width="650"
                        responsive={[
                            {
                                size: { width: 650, height: 400 },
                            },
                        ]}
                    />
                </div>
                <div className="aboutContent mt-4 md:px-8 homepageText space-y-5 basis-3/4">
                    <h4>
                        Curious student, professional software and web
                        developer, entrepreneur, activist and fast learner.
                    </h4>
                    <p>
                        Passionate about the places hardware and software
                        combine, space exploration, using technology to make a
                        difference, and “making” in almost any form (ask me
                        about my quest to perfect the perfect Buffalo wing
                        sauce). I seek interesting problems & love that feeling
                        I get when something I made starts working the way it’s
                        intended to.
                    </p>
                </div>
            </div>
            <div className="flex flex-col md:flex-row">
                <div className="flex-1 py-2 md:py-0">
                    <b>Programming languages</b>
                    <ul>
                        <li>Javascript + Typescript</li>
                        <li>Golang</li>
                        <li>Python</li>
                        <li>Ruby</li>
                        <li>C++</li>
                    </ul>
                </div>
                <div className="flex-1 py-2 md:py-0">
                    <b>Web technologies</b>
                    <ul>
                        <li>React</li>
                        <li>Node JS</li>
                        <li>Ruby on Rails</li>
                    </ul>
                </div>
                <div className="flex-1 py-2 md:py-0">
                    <b>Databases</b>
                    <ul>
                        <li>Postgresql</li>
                        <li>Mongodb</li>
                        <li>Redis</li>
                        <li>Kafka</li>
                    </ul>
                </div>
                <div className="flex-1 py-2 md:py-0">
                    <b>Data science</b>
                    <ul>
                        <li>Jupyter(lab, notebooks)</li>
                        <li>Numpy</li>
                        <li>NASA Panoply</li>
                        <li>Basic R and Matlab</li>
                    </ul>
                </div>
            </div>
            <div className="pt-6 pb-8 space-y-2 md:space-y-5">
                <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
                    Latest posts
                </h1>
                <PostList posts={loaderData.posts as SanityPost[]} />
            </div>

            <FitNewsletterForm title="Subsribe to my newsletter" />
        </div>
    );
}
