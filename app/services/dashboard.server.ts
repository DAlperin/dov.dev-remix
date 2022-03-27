import type { Dashboard } from "@prisma/client";

import { db } from "~/utils/db.server";

export async function createDashboard(name: string, ownerID: string, layout: string): Promise<Dashboard> {
    return db.dashboard.create({
        data: {
            ownerID,
            name,
            layout: JSON.parse(layout),
        },
        include: {
            owner: true,
        },
    })
}