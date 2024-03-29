import api from "@opentelemetry/api";
import type { User } from "@prisma/client";
import { redirect as runtimeRedirect } from "@remix-run/server-runtime";
import { compare, hash as bcryptHash } from "bcrypt";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

import { db } from "~/services/db.server";
import {
    commitSession,
    getSession,
    sessionStorage,
} from "~/utils/session.server";

export type sessionUser = {
    id: string;
};

export async function hash(password: string): Promise<string> {
    return bcryptHash(password, 10);
}

export async function logout(
    request: Request,
    options?: { redirectTo: string }
): Promise<void> {
    const session = await getSession(request.headers.get("Cookie"));
    session.unset("user");
    await commitSession(session);
    if (options) {
        throw runtimeRedirect(options.redirectTo);
    }
}

export async function ensureAdmin(
    request: Request,
    options: { failureRedirect: string }
): Promise<User> {
    const user = await isAuthenticated(request);
    if (!user) {
        throw runtimeRedirect(options.failureRedirect);
    }
    return user;
}

export async function isAuthenticated(
    request: Request,
    options?: { successRedirect?: string; failureRedirect?: string }
): Promise<false | User> {
    const session = await getSession(request.headers.get("Cookie"));
    const sessionUser = await auth.isAuthenticated(request);
    if (!sessionUser) {
        if (options?.failureRedirect) {
            throw runtimeRedirect(options.failureRedirect);
        }
        return false;
    }
    const user = await db.user.findUnique({ where: { id: sessionUser.id } });
    if (!user) {
        if (session.get("user")) {
            await logout(request);
        }
        if (options?.failureRedirect) {
            throw runtimeRedirect(options.failureRedirect);
        }
        return false;
    }
    const activeSpan = api.trace.getActiveSpan();
    if (activeSpan && user) {
        activeSpan.setAttribute("user.id", user.id);
        activeSpan.setAttribute("user.name", user.name);
    }
    if (options?.successRedirect) {
        throw runtimeRedirect(options.successRedirect);
    }
    return user;
}

export const auth = new Authenticator<sessionUser>(sessionStorage);

auth.use(
    new FormStrategy(async ({ form }) => {
        const email = form.get("email");
        const password = form.get("password");

        invariant(typeof email === "string", "email must be a string");
        invariant(email.length > 0, "email must not be empty");

        invariant(typeof password === "string", "password must be a string");
        invariant(password.length > 0, "password must not be empty");

        const user = await db.user.findUnique({ where: { email } });

        if (!user) {
            throw new AuthorizationError("Invalid username or password");
        }
        if (!(await compare(password, user.hash))) {
            throw new AuthorizationError("Invalid username or password");
        }

        const res: sessionUser = {
            id: user.id,
        };
        return res;
    })
);
