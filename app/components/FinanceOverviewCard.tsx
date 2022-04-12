import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

import ChargeRow from "~/components/ChargeRow";
import DashboardCard from "~/components/DashboardCard";
import type { ChargeWithCustomer } from "~/services/stripe.server";
import { usdFormatter } from "~/utils/formatter";

type Props = {
    totalCollected: number;
    chargesWithMoney: ChargeWithCustomer[];
};

export default function FinanceOverviewCard({
    totalCollected,
    chargesWithMoney,
}: Props): JSX.Element {
    return (
        <DashboardCard
            className="h-full"
            contentClassName="min-h-full md:min-h-0 h-full flex flex-col p-2 finance-card"
        >
            <h2>Finances</h2>
            <h3>{usdFormatter.format(totalCollected)} to date</h3>
            <h4>Recent charges:</h4>
            <div className="flex-1 justify-center">
                <AutoSizer>
                    {({ height, width }) => (
                        <FixedSizeList
                            height={height}
                            itemCount={chargesWithMoney.length}
                            itemSize={50}
                            width={width}
                        >
                            {({ index, style }) => (
                                <ChargeRow
                                    index={index}
                                    style={style}
                                    charges={chargesWithMoney}
                                />
                            )}
                        </FixedSizeList>
                    )}
                </AutoSizer>
            </div>
        </DashboardCard>
    );
}
