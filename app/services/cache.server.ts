/* eslint-disable */
// @ts-nocheck
import type { RedisOptions } from "ioredis";
import Redis from "ioredis"

import defaultRedisConfig from "~/config/defaultRedisConfig";

class ResourceCache {
    private static instance: ResourceCache

    public readonly redis: Redis.Redis

    private constructor(options?: RedisOptions) {
        if (this.redis === undefined && !options) { throw new Error("ioredis unitialized") }
        this.redis = new Redis(options)
    }

    public static getCache(options?: RedisOptions): ResourceCache {
        if (!ResourceCache.instance && !options) {
            throw new Error("ioredis unitialized")
        } else if (!ResourceCache.instance) {
            ResourceCache.instance = new ResourceCache(options)
        }
        return ResourceCache.instance
    }

    public async deleteWithPrefix(prefix: string) {
        const keys = await this.redis.keys(`${prefix}:*`)
        await this.redis.del(keys)
    }

    public async getWithPrefix(prefix: string) {
        const res = []
        const keys = await this.redis.keys(`${prefix}:*`)
        for (const key of keys) {
            const val = await this.redis.get(key)
            if (val) {
                res.push({
                    key,
                    val
                })
            }
        }
        return res
    }
}

let cache: ResourceCache;

declare global {
    let globalCache: ResourceCache;
}

if (process.env.NODE_ENV === "production") {
    cache = ResourceCache.getCache(defaultRedisConfig)
} else {
    if (!global.globalCache) {
        global.globalCache = ResourceCache.getCache(defaultRedisConfig);
    }
    cache = global.globalCache;
}
export { cache }