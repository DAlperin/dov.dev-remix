import { randomBytes as crypto_randomBytes } from "crypto";

export function genRandomID(): string {
    const randomBytes = crypto_randomBytes(8);
    return Buffer.from(randomBytes).toString("hex");
}
