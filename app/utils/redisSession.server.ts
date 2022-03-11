import type { SessionIdStorageStrategy } from "@remix-run/server-runtime/sessions";
import { randomBytes as crypto_randomBytes } from "crypto";
import Redis from "ioredis";
import type { Cookie, SessionData, SessionStorage } from "remix";
import { createSessionStorage } from "remix";

import { genRandomID } from "~/utils/random.server";

const expiresToSeconds = (expires: Date) => {
    const now = new Date();
    const expiresDate = new Date(expires);
    const secondsDelta = expiresDate.getSeconds() - now.getSeconds();
    return secondsDelta < 0 ? 0 : secondsDelta;
};

type redisSessionArguments = {
    cookie: SessionIdStorageStrategy["cookie"];
};

export function createRedisSessionStorage({
    cookie,
}: redisSessionArguments): SessionStorage {
    const redis = new Redis({
        port: 6379,
        family: 6,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD || undefined,
    });

    return createSessionStorage({
        cookie,
        async createData(data, expires) {
            const id = genRandomID();
            if (expires) {
                await redis.set(
                    id,
                    JSON.stringify(data),
                    "EX",
                    expiresToSeconds(expires)
                );
            } else {
                await redis.set(id, JSON.stringify(data));
            }
            return id;
        },
        async readData(id) {
            const data = await redis.get(id);
            if (data) {
                return JSON.parse(data);
            }
            return null;
        },
        async updateData(id, data, expires) {
            if (expires) {
                await redis.set(
                    id,
                    JSON.stringify(data),
                    "EX",
                    expiresToSeconds(expires)
                );
            } else {
                await redis.set(id, JSON.stringify(data));
            }
        },
        async deleteData(id) {
            await redis.del(id);
        },
    });
}
