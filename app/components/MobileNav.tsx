import type { User } from "@prisma/client";
import { Form, Link, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";

import ThemeSwitch from "./ThemeSwitch";

export type NavbarItem = {
    name: string;
    link: string;
    loggedinOnly?: boolean;
};

type Props = {
    navItems: NavbarItem[];
    user: User | false;
};

export function MobileNav({ navItems, user }: Props): JSX.Element {
    const transition = useTransition();
    const [navShow, setNavShow] = useState(false);
    const [initial, setInitial] = useState(transition.location);

    const onToggleNav = () => {
        setInitial(transition.location);
        setNavShow((status) => {
            if (status) {
                document.body.style.overflow = "auto";
            } else {
                // Prevent scrolling
                document.body.style.overflow = "hidden";
            }
            return !status;
        });
    };
    useEffect(() => {
        if (transition.location !== initial) setNavShow(false);
    }, [initial, transition.location]);

    return (
        <div className="sm:hidden">
            <button
                type="button"
                className="w-8 h-8 py-1 ml-1 mr-1 rounded"
                aria-label="Toggle Menu"
                onClick={onToggleNav}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="text-gray-900 dark:text-gray-100"
                >
                    {navShow ? (
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    ) : (
                        <path
                            fillRule="evenodd"
                            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                        />
                    )}
                </svg>
            </button>
            <div
                className={`fixed w-full h-full top-24 right-0 bg-gray-200 dark:bg-gray-800 opacity-95 z-10 transform ease-in-out duration-300 ${
                    navShow ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <button
                    type="button"
                    aria-label="toggle modal"
                    className="fixed w-full h-full cursor-auto focus:outline-none"
                    onClick={onToggleNav}
                />
                <nav className="fixed h-full mt-8">
                    {navItems.map((item) => (
                        <div key={item.name} className="px-12 py-4">
                            <Link
                                to={item.link}
                                className="text-2xl font-bold tracking-widest text-gray-900 dark:text-gray-100"
                                onClick={onToggleNav}
                            >
                                {item.name}
                            </Link>
                        </div>
                    ))}
                    <div className="px-9">
                        <ThemeSwitch />
                    </div>

                    <div className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 mx-12 px-5 rounded cursor-pointer">
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
                </nav>
            </div>
        </div>
    );
}

export default MobileNav;
