import {
    CartesianGrid,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
    Line,
    ResponsiveContainer,
} from "recharts";

import type { RechartsItem } from "~/services/stripe.server";
import { usdFormatter } from "~/utils/formatter";

type Props = {
    data: RechartsItem[];
};

function formatUSDTick(tick: number): string {
    return usdFormatter.format(tick);
}

export default function ChargeChart({ data }: Props): JSX.Element {
    return (
        <ResponsiveContainer className="h-full flex-1" width="98%" height="98%">
            <LineChart data={data} margin={{ top: 5, right: 15, left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval="preserveEnd" />
                <YAxis className="text-white" tickFormatter={formatUSDTick} />
                <Tooltip
                    wrapperClassName="!bg-gray-600"
                    formatter={formatUSDTick}
                />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    );
}
