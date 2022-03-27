import { useEffect } from "react";
import type { LoaderFunction } from "remix";
import {
    redirect,
    Outlet,
    useLoaderData,
    useLocation,
    useNavigate,
} from "remix";

import { isAuthenticated } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
    const { pathname } = new URL(request.url);
    const user = await isAuthenticated(request, {
        failureRedirect: "/login",
    });
    if (!user) {
        return;
    }
    if (user.admin) {
        if (pathname === "/dashboard") {
            return redirect("/dashboard/admin");
        }
        return {
            admin: true,
        };
    }
};

export default function Dashboard(): JSX.Element {
    const loader = useLoaderData();
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        if (location.pathname === "/dashboard" && loader.admin) {
            navigate("/dashboard/admin", { replace: false });
        }
    }, [loader.admin, location.pathname, navigate]);
    return (
        <div className="h-full p-8 container mx-auto">
            <Outlet />
        </div>
    );
}
