import type { ActionFunction } from "remix";

import { logout } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
    await logout(request, { redirectTo: "/login" });
};
