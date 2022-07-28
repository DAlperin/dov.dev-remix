import PicoSanity from "picosanity";

import { sanityClient, sanityConfig } from "~/config/sanity";

// // Authenticated client for fetching draft documents
export const previewClient = new PicoSanity({
    ...sanityConfig,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN ?? ``,
});

// Helper function to choose the correct client
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getSanityClient = (usePreview = false) =>
    usePreview ? previewClient : sanityClient;
