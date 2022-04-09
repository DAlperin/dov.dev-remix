import type { RedisOptions } from "ioredis";

import { assertedEnvVar } from "~/utils/environment.server";

const defaultRedisConfig: RedisOptions = {
    port: 6379,
    family: 6,
    host: assertedEnvVar("REDIS_HOST"),
    password: process.env.REDIS_PASSWORD ?? undefined,
}

export default defaultRedisConfig