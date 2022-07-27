import PicoSanity from "picosanity";

export const sanityConfig = {
    apiVersion: "2021-03-25",
    dataset: "production",
    projectId: "rg368k0k",
    useCdn: false,
};

export const sanityClient = new PicoSanity(sanityConfig);

// // Authenticated client for fetching draft documents
// export const previewClient = new PicoSanity({
//     ...sanityConfig,
//     useCdn: false,
//     token: process.env.SANITY_API_TOKEN ?? ``,
// });

// Helper function to choose the correct client
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getSanityClient = () => sanityClient;
