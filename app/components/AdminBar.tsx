import { Link } from "@remix-run/react";
import type { Location } from "history";

type Props = {
    location: Location;
};

const tabs = [
    {
        name: "Dashboard",
        location: "/dashboard/admin",
    },
    {
        name: "Keys",
        location: "/dashboard/admin/keys",
    },
];

export default function AdminBar({ location }: Props): JSX.Element {
    return (
        <div className="relative z-40 border-b border-gray-700 px-3 text-primary sm:px-6 lg:px-8">
            <header className="relative mx-auto">
                <div className="flex space-x-3 overflow-x-auto">
                    <Link className="opacity-50" to="/">
                        Go home
                    </Link>
                    {tabs.map((tabItem) => {
                        return (
                            <Link
                                to={tabItem.location}
                                key={tabItem.location}
                                className={`${
                                    location.pathname === tabItem.location
                                        ? "border-b border-blue-500"
                                        : ""
                                } whitespace-nowrap pb-3 pt-1 leading-none text-primary transition sm:px-2 font-semibold`}
                            >
                                {tabItem.name}
                            </Link>
                        );
                    })}
                </div>
            </header>
        </div>
    );
}
