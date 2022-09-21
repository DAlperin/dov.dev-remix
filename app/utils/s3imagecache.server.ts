/* eslint promise/prefer-await-to-then: 0 */
import {
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { Cache, CacheStatus } from "remix-image";
import type { Readable } from "stream";
import { tracer } from "../../telemetry";

export type s3CacheConfig = {
    bucketName: string;
    ttl: number;
    tbd: number;
};

export class S3Cache extends Cache {
    public config: s3CacheConfig;

    private readonly s3Client: S3Client;

    public constructor(config: s3CacheConfig) {
        super();

        this.s3Client = new S3Client({
            region: "us-east-1",
        });

        this.config = config;
    }

    public async get(key: string): Promise<Uint8Array | null> {
        return tracer.startActiveSpan("S3Cache.get", async (span) => {
            const data = await this.s3Client.send(
                new GetObjectCommand({
                    Bucket: this.config.bucketName,
                    Key: key,
                })
            );
            // @ts-expect-error We created the object...
            if (new Date(data.Metadata.expires) >= new Date()) {
                void this.s3Client
                    .send(
                        new DeleteObjectCommand({
                            Bucket: this.config.bucketName,
                            Key: key,
                        })
                    )
                    .catch();
                return null;
            }
            const stream = data.Body as Readable;
            const output = new Promise<Buffer>((resolve, reject) => {
                const chunks: Buffer[] = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.once("end", () => {
                    resolve(Buffer.concat(chunks));
                });
                stream.once("error", reject);
            });
            span.end();
            return output;
        });
    }

    public async set(key: string, resultImg: Uint8Array): Promise<void> {
        return tracer.startActiveSpan("S3Cache.set", async (span) => {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.config.bucketName,
                    Body: resultImg,
                    Key: key,
                    Metadata: {
                        expires: (Date.now() + this.config.ttl).toString(),
                    },
                })
            );
            span.end();
        });
    }

    public async has(key: string): Promise<boolean> {
        return tracer.startActiveSpan("S3Cache.has", async (span) => {
            try {
                await this.s3Client.send(
                    new HeadObjectCommand({
                        Bucket: this.config.bucketName,
                        Key: key,
                    })
                );
                span.end();
                return true;
            } catch {
                span.end();
                return false;
            }
        });
    }

    public async status(key: string): Promise<CacheStatus> {
        return tracer.startActiveSpan("S3Cache.status", async (span) => {
            try {
                const data = await this.s3Client.send(
                    new HeadObjectCommand({
                        Bucket: this.config.bucketName,
                        Key: key,
                    })
                );
                // @ts-expect-error we made the object...
                if (new Date(data.Metadata.expires) <= new Date()) {
                    return CacheStatus.HIT;
                }
                void this.s3Client
                    .send(
                        new DeleteObjectCommand({
                            Bucket: this.config.bucketName,
                            Key: key,
                        })
                    )
                    .catch();
                span.end();
                return CacheStatus.STALE;
            } catch {
                span.end();
                return CacheStatus.MISS;
            }
        });
    }

    // We don't use or implement this
    public clear(): Promise<void> {
        return Promise.resolve();
    }
}
