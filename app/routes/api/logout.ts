import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";

import { logout } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
    await logout(request, { redirectTo: "/login" });
};

export const loader: LoaderFunction = async () => {
    return redirect("/")
}