import type { ActionFunction } from "remix";
import { json } from "remix";

import { isAuthenticated } from "~/services/auth.server";
import { db } from "~/utils/db.server";
import { defaultDash } from "~/utils/defaultDashboard.server";

export const action: ActionFunction = async ({ request }) => {
    const user = await isAuthenticated(request);
    if (!user) {
        return json(
            {
                message: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }
    const data = await request.formData();
    const dashboardName = data.get("id");
    const rawLayout = data.get("layout");
    let layout
    if (rawLayout && typeof rawLayout === "string") { layout = JSON.parse(rawLayout) }
    else { layout = defaultDash }
    if (typeof dashboardName !== "string" || typeof rawLayout !== "string") {
        return json(
            {
                message: "Bad request",
            },
            {
                status: 400,
            }
        );
    }
    const newDashboard = await db.dashboard.create({
        data: {
            ownerID: user.id,
            name: dashboardName,
            layout,
        },
        include: {
            owner: true,
        },
    });
    if (!newDashboard) {
        return json({ message: "Internal database error" }, { status: 500 });
    }
    return json(newDashboard);
};
