import ChargeChart from "./ChargeChart";
import FinanceOverviewCard from "./FinanceOverviewCard";
import type {
    ChargeWithCustomer,
    RechartsItem,
} from "~/services/stripe.server";
import { cardType } from "~/utils/dashboards";

type Props = {
    type?: cardType;
    chartData?: RechartsItem[];
    financeData?: {
        totalCollected: number;
        chargesWithMoney: ChargeWithCustomer[];
    };
};

export default function DashboardItemRenderer({
    type,
    chartData,
    financeData,
}: Props): JSX.Element {
    switch (type) {
        case cardType.CHARGECHART:
            if (!chartData) throw new Error("chart has no data!");
            return <ChargeChart data={chartData} />;
        case cardType.FINANCEOVERVIEW:
            if (!financeData) throw new Error("finance chart has no data!");
            return (
                <FinanceOverviewCard
                    chargesWithMoney={financeData.chargesWithMoney}
                    totalCollected={financeData.totalCollected}
                />
            );
        default:
            return <p>Unhandled card type!</p>;
    }
}
