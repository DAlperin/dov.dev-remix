import { createRedisSessionStorage } from "remix-redis-session";

import { assertedEnvVar } from "./environment.server";
import defaultRedisConfig from "~/config/defaultRedisConfig";

export const sessionStorage = createRedisSessionStorage({
    cookie: {
        name: "dovdotdev",
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "lax" : false,
        secrets: [process.env.NODE_ENV === "production" ? assertedEnvVar("COOKIE_SECRET") : "s3cr3t"],
        path: "/",
        httpOnly: process.env.NODE_ENV === "production",
    },
    options: {
        redisConfig: defaultRedisConfig
    }
});

export const { getSession, commitSession, destroySession } = sessionStorage;
