import type { Prisma } from "@prisma/client";
import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import { isAuthenticated } from "~/services/auth.server";
import { db } from "~/services/db.server";

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
    const rawData = await request.formData();
    const dataField = rawData.get("data")
    const idField = rawData.get("id")

    if (
        typeof dataField !== "string" ||
        typeof idField !== "string"
    ) {
        return json(
            {
                message:
                    "Bad Request",
            },
            {
                status: 400,
            }
        );
    }
    const newData: Prisma.JsonObject = {
        data: JSON.parse(dataField),
    }
    /* HACK: We should probably check that the user has permissions on the dashboard separately
             so that we can use dashboard.update without having to specify the ownerID which is
             not allowed since the ownerID is not unique */
    const update = await db.dashboard.updateMany({
        where: {
            ownerID: user.id,
            id: idField,
        },
        data: {
            data: newData
        }
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
