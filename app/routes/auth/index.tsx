import { redirect } from "remix";

export function loader(): Response {
    return redirect("/auth/login");
}
