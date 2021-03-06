import type { User } from "@prisma/client";
import { Form, Link } from "@remix-run/react";
import type { ReactNode } from "react";

import MobileNav from "./MobileNav";
import ThemeSwitch from "./ThemeSwitch";
import type { NavbarItem } from "~/utils/navbar.server";

type Props = {
    children: ReactNode;
    user: false | User;
    navItems: NavbarItem[];
};

function LayoutWrapper({ children, user, navItems }: Props): JSX.Element {
    return (
        <div className="flex flex-col flow items-stretch justify-between h-full min-h-full flex-1">
            <header className="flex items-center justify-between pt-10 pb-8 flex-initial">
                <div>
                    <Link to="/" aria-label="dov.dev">
                        <div className="flex items-center justify-between">
                            <div className="h-6 text-2xl font-semibold">
                                dov.dev
                            </div>
                        </div>
                    </Link>
                </div>
                <MobileNav navItems={navItems} user={user} />
                <div className="hidden sm:flex items-center text-base leading-5">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.link}
                            className="p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <ThemeSwitch />
                    <div className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                        {user ? (
                            <Form
                                action="/api/logout"
                                method="post"
                                reloadDocument
                            >
                                <input
                                    className="cursor-pointer"
                                    type="submit"
                                    value="Logout"
                                    aria-label="Logout"
                                />
                            </Form>
                        ) : (
                            <Link to="/login">Login</Link>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 flex flex-col">{children}</main>
        </div>
    );
}

export default LayoutWrapper;
