import type { RedisOptions } from "ioredis";

const defaultRedisConfig: RedisOptions = {
    port: 6379,
    family: 6,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD ?? undefined,
}

export default defaultRedisConfig