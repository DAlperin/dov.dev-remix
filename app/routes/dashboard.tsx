import type { User, registrationSecret } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "remix";
import { useLoaderData } from "remix";

import DashboardAdminContent from "~/components/DashboardAdminContent";
import { auth, isAuthenticated } from "~/utils/auth.server";
import { db } from "~/utils/db.server";
import { genRandomID } from "~/utils/random.server";
import { commitSession, getSession } from "~/utils/session.server";

type LoaderData = {
    user: User;
    isAdmin: boolean;
    keys: registrationSecret[];
    newKey: string | null;
};

type ActionData = {
    newKey?: registrationSecret;
};

export const action: ActionFunction = async ({
    request,
}): Promise<null | undefined | ActionData> => {
    const user = await isAuthenticated(request, {
        failureRedirect: "/auth/login",
    });
    if (!user) {
        return;
    }
    if (!user.admin) {
    }
    const formData = await request.formData();
    const action = formData.get("_action");
    const session = await getSession(request.headers.get("cookie"));
    switch (action) {
        case "createKey": {
            const isAdmin = !!formData.get("admin");
            const newKey = await db.registrationSecret.create({
                data: {
                    key: genRandomID(),
                    admin: isAdmin,
                },
            });
            session.set("newKey", newKey.key);
            await commitSession(session);
            return {
                newKey,
            };
        }
        case "invalidate": {
            await db.registrationSecret.update({
                where: { key: formData.get("key")?.toString() },
                data: {
                    used: true,
                },
            });
            return null;
        }
        case "setAdmin": {
            const key = formData.get("key");
            const admin = formData.get("admin");
            await db.registrationSecret.update({
                where: { key: key?.toString() },
                data: { admin: admin === "on" },
            });
            return null;
        }
    }
    return null;
};

export const loader: LoaderFunction = async ({ request }) => {
    const user = await isAuthenticated(request, {
        failureRedirect: "/auth/login",
    });
    const session = await getSession(request.headers.get("cookie"));
    const newKey: registrationSecret | null = await session.get("newKey");
    if (newKey) {
        session.unset("newKey");
        await commitSession(session);
    }
    const keys = await db.registrationSecret.findMany({
        where: {
            used: false,
        },
        orderBy: [
            {
                createdAt: "asc",
            },
        ],
    });
    if (user) {
        return {
            user,
            isAdmin: user.admin,
            keys,
            newKey,
        };
    }
    return null;
};

export default function Dashboard(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    return (
        <>
            {loaderData?.isAdmin ? (
                <DashboardAdminContent
                    keys={loaderData.keys}
                    newKey={loaderData.newKey}
                />
            ) : (
                <h1>Hello normal user</h1>
            )}
        </>
    );
}
