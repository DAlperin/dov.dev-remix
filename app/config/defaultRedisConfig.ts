import type { RedisOptions } from "ioredis";

import { assertedEnvVar } from "~/utils/environment.server";

const baseHost = assertedEnvVar("REDIS_HOST")
const region = assertedEnvVar("FLY_REGION")

const host = `${region}.${baseHost}`

const defaultRedisConfig: RedisOptions = {
    port: 6379,
    family: 6,
    host,
    password: process.env.REDIS_PASSWORD ?? undefined,
}

export default defaultRedisConfig