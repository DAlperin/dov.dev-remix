import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import type Stripe from "stripe";

import { getAccountCharges, getTotalCollected } from "~/services/stripe.server";
import { usdFormatter } from "~/utils/formatter";

type LoaderData = {
    totalCollected: number;
    charges: Stripe.Response<Stripe.ApiList<Stripe.Charge>>;
};

export const loader: LoaderFunction = async () => {
    return {
        totalCollected: await getTotalCollected(),
        charges: await getAccountCharges(),
    };
};

export default function Finances(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    return (
        <div>
            <h2>
                Take-home to date:{" "}
                {usdFormatter.format(loaderData.totalCollected)}
            </h2>
        </div>
    );
}
