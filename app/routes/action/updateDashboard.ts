import type { ActionFunction } from "remix";
import { json } from "remix";

import { isAuthenticated } from "~/services/auth.server";
import { db } from "~/utils/db.server";

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
    const dashboardID = data.get("id")?.toString();
    const layout = JSON.parse(data.get("layout") as string);
    /* HACK: We should probably check that the user has permissions on the dashboard separately
             so that we can use dashboard.update without having to specify the ownerID which is
             not allowed since the ownerID is not unique */
    const update = await db.dashboard.updateMany({
        where: {
            ownerID: user.id,
            id: dashboardID,
        },
        data: {
            layout,
        },
    });
    if (update.count === 0) {
        return json(
            {
                message:
                    "Dashboard does not exist or user does not have access to it",
            },
            {
                status: 400,
            }
        );
    }
    return json(
        {
            message: "Dashboard updated",
        },
        {
            status: 200,
        }
    );
};
