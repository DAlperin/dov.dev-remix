import type { ActionFunction } from "remix";

import { auth, logout } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
    await logout(request, { redirectTo: "/auth/login" });
};
