import type { PrismaClient } from "@prisma/client";
import { Form, useActionData } from "@remix-run/react";
import type { LoaderFunction } from "remix";
import { json } from "remix";

import AnimatableLink from "~/components/AnimatableLink";
import { auth, hash, isAuthenticated } from "~/services/auth.server";
import { db } from "~/utils/db.server";
import emailRegex from "~/utils/emailregex";
import { isNativeError } from "~/utils/errors";

const badRequest = (data: ActionData) => json(data, { status: 400 });

type ActionData = {
    formError?: string;
    fieldErrors?: {
        key?: string | undefined;
        email?: string | undefined;
        password?: string | undefined;
        name?: string | undefined;
    };
    fields?: {
        key?: string;
        email?: string;
        password?: string;
        name?: string;
    };
};

async function validateKey(key: string, prisma: PrismaClient) {
    const findKey = await prisma.registrationSecret.findFirst({
        where: {
            key,
            used: false,
        },
    });
    if (!findKey) {
        return "Invalid invite key";
    }
}

function validateEmail(email: string) {
    const matches = email.match(emailRegex);
    if (!matches) {
        return "Invalid email :(";
    }
}

function validatePassword(password: string) {
    if (password.length <= 5) {
        return "Password must be longer than 5 characters";
    }
}

function validateName(name: string) {
    if (name.length <= 1) {
        return "Must be longer than one character";
    }
}

async function createUser(
    key: string,
    name: string,
    email: string,
    password: string,
    prisma: PrismaClient
): Promise<Error | undefined> {
    let isAdmin = false;
    const admin = await prisma.registrationSecret.findFirst({
        where: { key, used: false },
    });
    if (admin?.admin) {
        isAdmin = true;
    }
    const passwordHash = await hash(password);
    if (!hash) {
        return new Error("Failed to hash password");
    }
    try {
        await prisma.user.create({
            data: {
                email,
                name,
                hash: passwordHash,
                admin: isAdmin,
            },
        });
        await prisma.registrationSecret.update({
            where: { key },
            data: { used: true },
        });
    } catch (error) {
        if (isNativeError(error)) {
            return error as Error;
        }
    }
}

export const action: LoaderFunction = async ({ request }) => {
    const clonedRequest = request.clone();
    const body = await clonedRequest.formData();
    const key = body.get("key");
    const email = body.get("email");
    const password = body.get("password");
    const name = body.get("name");
    if (
        typeof key !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof name !== "string"
    ) {
        return badRequest({
            formError: "Form submitted incorrectly",
        });
    }
    const fieldErrors = {
        key: await validateKey(key, db),
        email: validateEmail(email),
        password: validatePassword(password),
        name: validateName(name),
    };
    const fields = { key, email, password, name };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({ fieldErrors, fields });
    }
    const user = await createUser(key, name, email, password, db);
    if (isNativeError(user)) {
        return json(
            {
                formError: "Server error",
            },
            { status: 500 }
        );
    }
    await auth.authenticate("form", request, {
        successRedirect: "/",
        failureRedirect: "/login",
    });
};
export const loader: LoaderFunction = async ({ request }) => {
    return isAuthenticated(request, { successRedirect: "/" });
    return null;
};

const nameError = "name-error";
export default function Register(): JSX.Element {
    const actionData = useActionData<ActionData>();

    return (
        <>
            <h1>Register</h1>
            <Form method="post" className="mt-5">
                <label className="uppercase text-sm font-bold opacity-70">
                    Invite key
                    <input
                        type="text"
                        name="key"
                        className="p-3 mt-2 mb-4 w-full bg-slate-200 dark:bg-gray-700 rounded border-2 border-slate-200 dark:border-gray-400 focus:border-slate-600 focus:outline-none"
                        aria-label="key input"
                        aria-invalid={
                            Boolean(actionData?.fieldErrors?.key) || undefined
                        }
                        aria-errormessage={
                            actionData?.fieldErrors?.key ? nameError : undefined
                        }
                    />
                </label>
                {actionData?.fieldErrors?.key ? (
                    <p
                        className="mt-0 text-red-700 italic"
                        role="alert"
                        id="key-error"
                    >
                        {actionData.fieldErrors.key}
                    </p>
                ) : null}
                <label className="uppercase text-sm font-bold opacity-70">
                    Name
                    <input
                        type="text"
                        name="name"
                        className="p-3 mt-2 mb-4 w-full bg-slate-200 dark:bg-gray-700 rounded border-2 border-slate-200 dark:border-gray-400 focus:border-slate-600 focus:outline-none"
                        aria-label="name input"
                        aria-invalid={
                            Boolean(actionData?.fieldErrors?.name) || undefined
                        }
                        aria-errormessage={
                            actionData?.fieldErrors?.name
                                ? nameError
                                : undefined
                        }
                    />
                </label>
                {actionData?.fieldErrors?.name ? (
                    <p
                        className="mt-0 text-red-700 italic"
                        role="alert"
                        id="key-error"
                    >
                        {actionData.fieldErrors.name}
                    </p>
                ) : null}
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
                                ? nameError
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
                                ? nameError
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
                    aria-label="submit button"
                    value="Register"
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
            </Form>
            <p>
                Or go{" "}
                <AnimatableLink
                    to="/login"
                    className="hover:underline text-blue-400"
                >
                    login
                </AnimatableLink>{" "}
                instead!
            </p>
        </>
    );
}
