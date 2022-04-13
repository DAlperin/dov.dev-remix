import type { registrationSecret, User } from "@prisma/client";
import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { useState } from "react";

import KeysTable from "~/components/KeysTable";
import { ensureAdmin, isAuthenticated } from "~/services/auth.server";
import { db } from "~/services/db.server";
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

export const loader: LoaderFunction = async ({ request }) => {
    const user = await isAuthenticated(request, {
        failureRedirect: "/login",
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

export const action: ActionFunction = async ({
    request,
}): Promise<null | undefined | ActionData> => {
    const user = await ensureAdmin(request, {
        failureRedirect: "/dashboard",
    });
    if (!user) {
        return;
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
        default: {
            throw new Error("unhandled");
        }
    }
    return null;
};

export default function Keys(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    const [CurrentlyInvalidating, setCurrentlyInvalidating] = useState("");
    return (
        <div className="h-full">
            {loaderData.keys.length > 0 ? (
                <div>
                    <h2>Manage keys</h2>
                    <KeysTable
                        newKey={loaderData.newKey}
                        keys={loaderData.keys}
                        CurrentlyInvalidating={CurrentlyInvalidating}
                        setCurrentlyInvalidating={setCurrentlyInvalidating}
                    />
                </div>
            ) : null}
            <hr />
            <h3 className="leading-snug">Create new registration key</h3>
            <Form method="post" className="w-1/4 mt-1">
                <label className="uppercase text-xl">
                    <input
                        type="checkbox"
                        name="admin"
                        className="mr-2 p-3 mb-1 w-full w-0.5 bg-slate-200 dark:bg-gray-700 rounded border-2 border-slate-200 dark:border-gray-400 focus:border-slate-600 focus:outline-none"
                        aria-label="admin checkbox"
                    />
                    Admin
                </label>
                <button
                    type="submit"
                    className="py-3 mt-1 px-6 my-2 bg-slate-700 dark:bg-slate-900 text-white font-medium rounded hover:bg-indigo-500 cursor-pointer ease-in-out duration-300 block"
                    name="_action"
                    value="createKey"
                >
                    Create
                </button>
            </Form>
        </div>
    );
}
