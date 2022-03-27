import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
} from "chart.js";
import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import type Stripe from "stripe";

import { getAccountCharges, getTotalCollected } from "~/services/stripe.server";
import { usdFormatter } from "~/utils/formatter";

type LoaderData = {
    totalCollected: number;
    charges: Stripe.Response<Stripe.ApiList<Stripe.Charge>>;
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
);

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
