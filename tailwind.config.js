const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    content: ["./app/**/*.{ts,tsx,jsx,js}"],
    darkMode: "class",
    theme: {
        extend: {
            spacing: {
                "9/16": "56.25%",
            },
            lineHeight: {
                11: "2.75rem",
                12: "3rem",
                13: "3.25rem",
                14: "3.5rem",
            },
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: colors.teal,
                // @ts-ignore
                gray: colors.neutral, // TODO: Remove ts-ignore after tw types gets updated to v3
            },
            typography: (theme) => {
                const gray100 = theme("colors.gray.100");
                const gray700 = theme("colors.gray.700");
                const primary400 = theme("colors.primary.400");
                const spacingTight = theme("letterSpacing.tight");
                const gray900 = theme("colors.gray.900");
                const gray800 = theme("colors.gray.800");
                return {
                    DEFAULT: {
                        css: {
                            color: gray700,
                            a: {
                                color: theme("colors.primary.500"),
                                "&:hover": {
                                    color: theme("colors.primary.600"),
                                },
                                code: { color: primary400 },
                            },
                            h1: {
                                fontWeight: "700",
                                letterSpacing: spacingTight,
                                color: gray900,
                            },
                            h2: {
                                fontWeight: "700",
                                letterSpacing: spacingTight,
                                color: gray900,
                            },
                            h3: {
                                fontWeight: "600",
                                color: gray900,
                            },
                            "h4,h5,h6": {
                                color: gray900,
                            },
                            pre: {
                                backgroundColor: gray800,
                            },
                            code: {
                                color: theme("colors.pink.500"),
                                backgroundColor: gray100,
                                paddingLeft: "4px",
                                paddingRight: "4px",
                                paddingTop: "2px",
                                paddingBottom: "2px",
                                borderRadius: "0.25rem",
                            },
                            "code::before": {
                                content: "none",
                            },
                            "code::after": {
                                content: "none",
                            },
                            details: {
                                backgroundColor: gray100,
                                paddingLeft: "4px",
                                paddingRight: "4px",
                                paddingTop: "2px",
                                paddingBottom: "2px",
                                borderRadius: "0.25rem",
                            },
                            hr: { borderColor: theme("colors.gray.200") },
                            "ol li::marker": {
                                fontWeight: "600",
                                color: theme("colors.gray.500"),
                            },
                            "ul li::marker": {
                                backgroundColor: theme("colors.gray.500"),
                            },
                            strong: { color: theme("colors.gray.600") },
                            blockquote: {
                                color: gray900,
                                borderLeftColor: theme("colors.gray.200"),
                            },
                        },
                    },
                    dark: {
                        css: {
                            color: theme("colors.gray.300"),
                            a: {
                                color: theme("colors.primary.500"),
                                "&:hover": {
                                    color: primary400,
                                },
                                code: { color: primary400 },
                            },
                            h1: {
                                fontWeight: "700",
                                letterSpacing: spacingTight,
                                color: gray100,
                            },
                            h2: {
                                fontWeight: "700",
                                letterSpacing: spacingTight,
                                color: gray100,
                            },
                            h3: {
                                fontWeight: "600",
                                color: gray100,
                            },
                            "h4,h5,h6": {
                                color: gray100,
                            },
                            pre: {
                                backgroundColor: gray800,
                            },
                            code: {
                                backgroundColor: gray800,
                            },
                            details: {
                                backgroundColor: gray800,
                            },
                            hr: { borderColor: gray700 },
                            "ol li::marker": {
                                fontWeight: "600",
                                color: theme("colors.gray.400"),
                            },
                            "ul li::marker": {
                                backgroundColor: theme("colors.gray.400"),
                            },
                            strong: { color: gray100 },
                            thead: {
                                th: {
                                    color: gray100,
                                },
                            },
                            tbody: {
                                tr: {
                                    borderBottomColor: gray700,
                                },
                            },
                            blockquote: {
                                color: gray100,
                                borderLeftColor: gray700,
                            },
                        },
                    },
                };
            },
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
    ],
};
