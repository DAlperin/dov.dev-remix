export { resolveTxt } from "dns";

export function assertedEnvVar(key: string): string {
    const rawValue = process.env[key]
    if (!rawValue) throw new Error(`Missing environment variable: ${key}`)
    return rawValue
}