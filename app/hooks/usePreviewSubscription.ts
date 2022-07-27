/* eslint-disable */
// @ts-nocheck
import type { GroqStore } from "@sanity/groq-store";
import { useEffect, useState } from "react";

import { sanityConfig as config } from "~/config/sanity";

export function usePreviewSubscription(
    query: string,
    subscriptionOptions: {
        params: Record<string, unknown>;
        initialData: unknown;
    }
) {
    const { params, initialData } = subscriptionOptions;
    const [data, setData] = useState(initialData);

    useEffect(() => {
        let sub: { unsubscribe: () => void };
        let store: GroqStore;

        async function createStore() {
            // For more details about configuring groq-store see:
            // https://www.npmjs.com/package/@sanity/groq-store
            const {
                default: { groqStore },
            } = await import("@sanity/groq-store");

            const { projectId, dataset } = config;

            store = groqStore({
                projectId,
                dataset,
                listen: true,
                overlayDrafts: true,
                documentLimit: 1000,
            });

            store.subscribe(
                query,
                params ?? {}, // Params
                (err, result) => {
                    if (err) {
                        console.error("Oh no, an error:", err);
                        return;
                    }
                    setData(result);
                }
            );
        }

        if (!store) {
            // eslint-disable
            createStore();
        }

        return () => {
            if (sub?.unsubscribe()) sub.unsubscribe();
            if (store) store.close();
        };
    }, []);

    return { data };
}
