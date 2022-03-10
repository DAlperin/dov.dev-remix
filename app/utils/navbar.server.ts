import json from "../../content/navbar.json";

export type NavbarItem = {
    name: string;
    link: string;
    loggedinOnly?: boolean;
};

const items: NavbarItem[] = json;

export function getNavbarItems(includeLoggedIn = false): NavbarItem[] {
    if (includeLoggedIn) {
        return items;
    }
    return items.filter((item) => !item.loggedinOnly);
}
