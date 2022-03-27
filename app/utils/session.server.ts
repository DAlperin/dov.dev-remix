import { createRedisSessionStorage } from "remix-redis-session";

import defaultRedisConfig from "~/config/defaultRedisConfig";

export const sessionStorage = createRedisSessionStorage({
    cookie: {
        name: "dovdotdev",
        secure: true,
        sameSite: "lax",
        secrets: ["s3cr3t"],
        path: "/",
        httpOnly: false,
    },
    options: {
        redisConfig: defaultRedisConfig
    }
});

export const { getSession, commitSession, destroySession } = sessionStorage;
