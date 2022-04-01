import type { Dashboard, Prisma, User } from "@prisma/client";

import { db } from "~/services/db.server";
import type { dashboardConfig, dashItem } from "~/utils/dashboards";
import { defaultDash } from "~/utils/dashboards";
import { genRandomID } from "~/utils/random.server";

export async function createDashboard(name: string, ownerID: string, layout: string): Promise<Dashboard> {
    return db.dashboard.create({
        data: {
            ownerID,
            name,
            data: JSON.parse(layout),
        },
        include: {
            owner: true,
        },
    })
}

function generateNewDashboardFromDefault() {
    const keys = Object.keys(defaultDash.layouts)
    const dataKeys = Object.keys(defaultDash.data)
    const newI = new Map<string, string>()
    const result: dashboardConfig = { data: defaultDash.data, layouts: { lg: [], md: [], sm: [], xs: [] } }
    for (const breakpoint of dataKeys) {
        const breakpointItems = defaultDash.data[breakpoint]
        for (const item of breakpointItems) {
            const existing = newI.get(item.i)
            if (existing) {
                item.i = existing
            } else {
                const randomID = genRandomID()
                newI.set(item.i, randomID)
                item.i = randomID
            }
        }
    }
    for (const breakpoint of keys) {
        const breakpointItems = defaultDash.layouts[breakpoint]
        for (const item of breakpointItems) {
            const key = newI.get(item.i)
            if (!key) return
            item.i = key
            result.layouts[breakpoint].push(item as dashItem)
        }
    }
    return result
}

export async function getDefaultDashboardForUser(user: User): Promise<Dashboard> {
    const existingDash = await db.dashboard.findFirst({
        where: {
            default: true,
            owner: user
        }
    })
    if (existingDash?.data) {
        // @ts-expect-error prisma, json, etc
        existingDash.data.id = existingDash?.id
        return existingDash.data as Dashboard
    }
    const newDash: Prisma.JsonObject = generateNewDashboardFromDefault() as unknown as Prisma.JsonObject
    const savedDash = await db.dashboard.create({
        data: {
            data: newDash,
            name: "Default",
            default: true,
            ownerID: user.id
        }
    })
    return savedDash.data as Dashboard
}