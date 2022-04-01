import { createRedisSessionStorage } from "remix-redis-session";

import defaultRedisConfig from "~/config/defaultRedisConfig";

export const sessionStorage = createRedisSessionStorage({
    cookie: {
        name: "dovdotdev",
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "lax" : false,
        secrets: ["s3cr3t"],
        path: "/",
        httpOnly: false,
    },
    options: {
        redisConfig: defaultRedisConfig
    }
});

export const { getSession, commitSession, destroySession } = sessionStorage;
