/* eslint-disable no-console */
import type { Headers } from "@remix-run/node";
import { Response } from "@remix-run/node";
import isbot from "isbot";
// @ts-expect-error react types havent caught up to react 18 yet
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "remix";
import type { EntryContext } from "remix";
import { PassThrough } from "stream";

const ABORT_DELAY = 5000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    remixContext: EntryContext
): Promise<unknown> {
    const callbackName = isbot(request.headers.get("user-agent"))
        ? "onAllReady"
        : "onShellReady";

    return new Promise((resolve, reject) => {
        let didError = false;

        const { pipe, abort } = renderToPipeableStream(
            <RemixServer context={remixContext} url={request.url} />,
            {
                [callbackName]() {
                    const body = new PassThrough();

                    responseHeaders.set("Content-Type", "text/html");

                    resolve(
                        new Response(body, {
                            status: didError ? 500 : responseStatusCode,
                            headers: responseHeaders,
                        })
                    );
                    pipe(body);
                },
                onShellError(err: Error) {
                    reject(err);
                },
                onError(error: Error) {
                    didError = true;
                    console.error(error);
                },
            }
        );
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        setTimeout(abort, ABORT_DELAY);
    });
}
