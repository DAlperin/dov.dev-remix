import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import AnimatableLink from "~/components/AnimatableLink";
import { auth, isAuthenticated } from "~/services/auth.server";
import { getSession } from "~/utils/session.server";

const badRequest = (data: ActionData) => json(data, { status: 400 });

type ActionData = {
    formError?: string;
    fieldErrors?: {
        email?: string | undefined;
        password?: string | undefined;
    };
    fields?: {
        email?: string;
        password?: string;
    };
};

type LoaderData = {
    error: { message: string } | null;
};

export const action: LoaderFunction = async ({ request }) => {
    const clonedRequest = request.clone();
    const body = await clonedRequest.formData();
    const email = body.get("email");
    const password = body.get("password");
    if (typeof email !== "string" || typeof password !== "string") {
        return badRequest({
            formError: "Form submitted incorrectly",
        });
    }
    await auth.authenticate("form", request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
};

export const loader: LoaderFunction = async ({ request }) => {
    await isAuthenticated(request, {
        successRedirect: "/",
    });
    const session = await getSession(request.headers.get("cookie"));
    const error = session.get(auth.sessionErrorKey) as LoaderData["error"];
    return json<LoaderData>({ error });
};

export default function Login(): JSX.Element {
    const actionData = useActionData<ActionData>();
    const loaderData = useLoaderData<LoaderData>();
    return (
        <>
            <h1>Login</h1>
            <Form method="post" className="mt-5">
                <label className="uppercase text-sm font-bold opacity-70">
                    Email
                    <input
                        type="text"
                        name="email"
                        className="p-3 mt-2 mb-4 w-full bg-slate-200 dark:bg-gray-700 rounded border-2 border-slate-200 dark:border-gray-400 focus:border-slate-600 focus:outline-none"
                        aria-label="email input"
                        aria-invalid={
                            Boolean(actionData?.fieldErrors?.email) || undefined
                        }
                        aria-errormessage={
                            actionData?.fieldErrors?.email
                                ? "name-error"
                                : undefined
                        }
                    />
                </label>
                {actionData?.fieldErrors?.email ? (
                    <p
                        className="mt-0 text-red-700 italic"
                        role="alert"
                        id="key-error"
                    >
                        {actionData.fieldErrors.email}
                    </p>
                ) : null}
                <label className="uppercase text-sm font-bold opacity-70">
                    Password
                    <input
                        type="password"
                        name="password"
                        className="p-3 mt-2 mb-4 w-full bg-slate-200 dark:bg-gray-700 rounded border-2 border-slate-200 dark:border-gray-400 focus:border-slate-600 focus:outline-none"
                        aria-label="password input"
                        aria-invalid={
                            Boolean(actionData?.fieldErrors?.password) ||
                            undefined
                        }
                        aria-errormessage={
                            actionData?.fieldErrors?.password
                                ? "name-error"
                                : undefined
                        }
                    />
                </label>
                {actionData?.fieldErrors?.password ? (
                    <p
                        className="mt-0 text-red-700 italic"
                        role="alert"
                        id="key-error"
                    >
                        {actionData.fieldErrors.password}
                    </p>
                ) : null}
                <input
                    type="submit"
                    className="py-3 px-6 my-2 bg-slate-700 dark:bg-slate-900 text-white font-medium rounded hover:bg-indigo-500 cursor-pointer ease-in-out duration-300"
                    aria-label="login button"
                    value="Login"
                />
                {actionData?.formError ? (
                    <p
                        className="mt-0 text-red-700 italic"
                        role="alert"
                        id="key-error"
                    >
                        {actionData.formError}
                    </p>
                ) : null}
                {loaderData?.error ? (
                    <p
                        className="mt-0 text-red-700 italic"
                        role="alert"
                        id="key-error"
                    >
                        {loaderData.error.message}
                    </p>
                ) : null}
            </Form>
            <p>
                Or go{" "}
                <AnimatableLink
                    to="/register"
                    className="hover:underline text-blue-400"
                >
                    register
                </AnimatableLink>{" "}
                instead!
            </p>
        </>
    );
}
