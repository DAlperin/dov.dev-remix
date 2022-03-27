import type { registrationSecret } from "@prisma/client";
import { Form, useTransition } from "@remix-run/react";
import { useState } from "react";

import KeysTable from "~/components/KeysTable";

type Props = {
    keys: registrationSecret[];
    newKey: string | null;
};

export default function DashboardAdminContent({
    keys,
    newKey,
}: Props): JSX.Element {
    const transition = useTransition();
    const [CurrentlyInvalidating, setCurrentlyInvalidating] = useState("");
    return (
        <div className="h-full">
            <h1>Hello admin!</h1>
            {keys.length > 0 ? (
                <div>
                    <h2>Manage keys</h2>
                    <KeysTable
                        newKey={newKey}
                        keys={keys}
                        transition={transition}
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
                        className="mr-2 p-3 mb-1 w-full bg-slate-200 dark:bg-gray-700 rounded border-2 border-slate-200 dark:border-gray-400 focus:border-slate-600 focus:outline-none"
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
