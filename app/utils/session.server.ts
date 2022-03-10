import { createRedisSessionStorage } from "~/utils/redisSession.server";

export const sessionStorage = createRedisSessionStorage({
    cookie: {
        name: "dovdotdev",
        secure: true,
        sameSite: "lax",
        secrets: ["s3cr3t"],
        path: "/",
        httpOnly: true,
    },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
