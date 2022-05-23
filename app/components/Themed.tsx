import React from "react";
import { useTheme } from "remix-themes";
import { ClientOnly } from "remix-utils";

/**
 * This allows you to render something that depends on the theme without
 * worrying about whether it'll SSR properly when we don't actually know
 * the user's preferred theme.
 * From: https://github.com/kentcdodds/kentcdodds.com/blob/main/app/utils/theme-provider.tsx#L189
 */
export default function Themed({
    dark,
    light,
    initialOnly = false,
}: {
    dark: React.ReactNode | string;
    light: React.ReactNode | string;
    initialOnly?: boolean;
}): JSX.Element {
    const [theme] = useTheme();
    const [initialTheme] = React.useState(theme);
    const themeToReference = initialOnly ? initialTheme : theme;

    return (
        <ClientOnly>
            {() => (themeToReference === "light" ? light : dark)}
        </ClientOnly>
    );
}
