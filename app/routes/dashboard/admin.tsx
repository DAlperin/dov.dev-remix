import { Responsive, WidthProvider } from "react-grid-layout";
import reactGridStyles from "react-grid-layout/css/styles.css";
import reactResizeStyles from "react-resizable/css/styles.css";
import type { LoaderFunction, LinksFunction } from "remix";
import { Outlet, useLoaderData } from "remix";

import ChargeChart from "~/components/ChargeChart";
import FinanceOverviewCard from "~/components/FinanceOverviewCard";
import type {
    ChargeWithCustomer,
    RechartsItem,
} from "~/services/stripe.server";
import {
    amountPerMonth,
    getRecentChargesWithCustomer,
    getTotalCollected,
    perMonthToChartData,
} from "~/services/stripe.server";

export const links: LinksFunction = () => {
    return [
        { rel: "stylesheet", href: reactResizeStyles },
        { rel: "stylesheet", href: reactGridStyles },
    ];
};

type LoaderData = {
    totalCollected: number;
    chargesWithCustomers: ChargeWithCustomer[];
    chartData: RechartsItem[];
};

// WidthProvider is named externally
// eslint-disable-next-line new-cap
const ResponsiveGridLayout = WidthProvider(Responsive);

export const loader: LoaderFunction = async () => {
    return {
        totalCollected: await getTotalCollected(),
        chargesWithCustomers: await getRecentChargesWithCustomer(),
        chartData: perMonthToChartData(await amountPerMonth()),
    };
};
export default function Admin(): JSX.Element {
    const loaderData = useLoaderData<LoaderData>();
    const chargesWithMoney: ChargeWithCustomer[] =
        loaderData.chargesWithCustomers.filter((charge) => {
            if (charge.chargeAmount > 0) {
                return true;
            }
            return false;
        });
    const layouts = {
        lg: [
            {
                w: 8,
                h: 2,
                x: 0,
                y: 0,
                i: "a",
                type: "abc",
            },
            {
                w: 4,
                h: 2,
                x: 8,
                y: 0,
                i: "b",
                type: "abc2",
            },
            {
                w: 5,
                h: 2,
                x: 0,
                y: 0,
                i: "c",
                type: "abc3",
            },
            {
                w: 3,
                h: 2,
                x: 5,
                y: 0,
                i: "d",
            },
            {
                w: 4,
                h: 2,
                x: 9,
                y: 2,
                i: "e",
            },
            {
                w: 3,
                h: 2,
                x: 3,
                y: 2,
                i: "f",
            },
            {
                w: 3,
                h: 2,
                x: 0,
                y: 2,
                i: "g",
            },
        ],
        md: [
            {
                w: 6,
                h: 2,
                x: 0,
                y: 0,
                i: "a",
            },
            {
                w: 4,
                h: 2,
                x: 6,
                y: 0,
                i: "b",
            },
            {
                w: 3,
                h: 2,
                x: 0,
                y: 0,
                i: "c",
            },
            {
                w: 3,
                h: 2,
                x: 3,
                y: 0,
                i: "d",
            },
            {
                w: 4,
                h: 2,
                x: 6,
                y: 2,
                i: "e",
            },
            {
                w: 3,
                h: 2,
                x: 3,
                y: 2,
                i: "f",
            },
            {
                w: 3,
                h: 2,
                x: 0,
                y: 2,
                i: "g",
            },
        ],
        sm: [
            {
                w: 6,
                h: 2,
                x: 0,
                y: 0,
                i: "a",
            },
            {
                w: 3,
                h: 2,
                x: 0,
                y: 0,
                i: "b",
            },
            {
                w: 3,
                h: 2,
                x: 3,
                y: 0,
                i: "c",
            },
            {
                w: 3,
                h: 2,
                x: 0,
                y: 0,
                i: "d",
            },
            {
                w: 3,
                h: 2,
                x: 3,
                y: 2,
                i: "e",
            },
            {
                w: 3,
                h: 2,
                x: 0,
                y: 2,
                i: "f",
            },
            {
                w: 3,
                h: 2,
                x: 3,
                y: 2,
                i: "g",
            },
        ],
        xs: [
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "a",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "b",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "c",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "d",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 2,
                i: "e",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 2,
                i: "f",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 2,
                i: "g",
            },
        ],
    };

    return (
        <div className="h-full">
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                isDraggable
                width={800}
                isResizable
                isBounded
                breakpoints={{ lg: 1280, md: 992, sm: 767, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            >
                <div className="bg-gray-700 rounded" key="a">
                    <ChargeChart data={loaderData.chartData} />
                    {/* a*/}
                </div>
                <div className="" key="b">
                    <FinanceOverviewCard
                        totalCollected={loaderData.totalCollected}
                        chargesWithMoney={chargesWithMoney}
                    />
                </div>
                <div className="bg-gray-500" key="c">
                    c
                </div>
                <div className="bg-gray-500" key="d">
                    d
                </div>
                <div className="bg-gray-500" key="e">
                    e
                </div>
                <div className="bg-gray-500" key="f">
                    f
                </div>
                <div className="bg-gray-500" key="g">
                    g
                </div>
            </ResponsiveGridLayout>
            <Outlet />
        </div>
    );
}
