import type { User } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/server-runtime";
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

export const loader: LoaderFunction = async ({ request }) => {
    return {
        user: await isAuthenticated(request),
        posts: await getPosts(5),
    };
};

export default function Index(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
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
                <div className="pt-8 rounded-2xl basis-3/4">
                    <Image
                        src="/static/headshot.png"
                        alt="Dov Alperin headshot"
                        height="600"
                        width="1000"
                        style={{
                            marginLeft: "auto",
                            marginRight: "auto",
                        }}
                        options={{
                            fit: "cover",
                        }}
                        responsive={[
                            {
                                size: {
                                    width: 1000,
                                    height: 600,
                                },
                            },
                            {
                                size: {
                                    width: 500,
                                    height: 500,
                                },
                                maxWidth: 748,
                            },
                            {
                                size: {
                                    width: 400,
                                    height: 400,
                                },
                                maxWidth: 640,
                            },
                        ]}
                    />
                </div>
                <div className="aboutContent pt-8 md:px-8 homepageText space-y-5 basis-3/4">
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
                <PostList posts={loaderData.posts} />
            </div>

            <FitNewsletterForm title="Subsribe to my newsletter" />
        </div>
    );
}
