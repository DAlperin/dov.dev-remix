module.exports = {
    extends: "galex",
    ignorePatterns: ["build", "public/build/**"],
    rules: {
        // Tailwind configuration...
        "import/dynamic-import-chunkname": 0,
        // Move fast, break things, etc, etc, etc
        "unicorn/no-abusive-eslint-disable": 0,
        // In Remix, we can throw a RuntimeRedirect to bubble up a redirect to a loader or action
        "@typescript-eslint/no-throw-literal": 0,
        "curly": 0,
    },
};
