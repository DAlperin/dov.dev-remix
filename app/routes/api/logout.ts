import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";

import { logout } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
    await logout(request, { redirectTo: "/login" });
};

export const loader: LoaderFunction = async () => {
    return redirect("/")
}