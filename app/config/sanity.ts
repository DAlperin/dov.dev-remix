import PicoSanity from "picosanity";

export const sanityConfig = {
    apiVersion: "2021-03-25",
    dataset: "production",
    projectId: "rg368k0k",
    useCdn: false,
};
export const sanityClient = new PicoSanity(sanityConfig);
