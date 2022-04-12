import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

import { assertedEnvVar } from "~/utils/environment.server";

export const action: ActionFunction = async ({ request }) => {
    const FORM_ID = assertedEnvVar("CONVERTKIT_FORM_ID")
    const API_KEY = assertedEnvVar("CONVERTKIT_API_KEY")
    const API_URL = assertedEnvVar("CONVERTKIT_API_URL")

    const data = await request.formData()
    const email = data.get("email");

    try {
        const data = { email, api_key: API_KEY }

        const response = await fetch(`${API_URL}forms/${FORM_ID}/subscribe`, {
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })

        if (response.status >= 400) {
            return json({ error: "Subscribe failed" })
        }

        return json({ ok: true });
    } catch (error) {
        const errorMessage = (error as Error).message
        return json({ error: errorMessage });
    }
}