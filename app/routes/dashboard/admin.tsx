import { Outlet, useLocation } from "@remix-run/react";

import AdminBar from "~/components/AdminBar";

export default function Admin(): JSX.Element {
    const location = useLocation();
    return (
        <div className="h-full">
            <AdminBar location={location} />
            <Outlet />
        </div>
    );
}
