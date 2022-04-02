import { useEffect, useMemo, useState } from "react";
import type { Layout, Layouts } from "react-grid-layout";
import { Responsive, WidthProvider as widthProvider } from "react-grid-layout";
import reactGridStyles from "react-grid-layout/css/styles.css";
import reactResizeStyles from "react-resizable/css/styles.css";
import type { LoaderFunction, LinksFunction } from "remix";
import { useFetcher, Outlet, useLoaderData } from "remix";

import DashboardItemRenderer from "~/components/DashboardItemRenderer";
import { ensureAdmin } from "~/services/auth.server";
import { getDefaultDashboardForUser } from "~/services/dashboard.server";
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
import type {
    breakPointsTo,
    dashboardConfig,
    dataItem,
} from "~/utils/dashboards";
import { mergeLayoutsToDashboard } from "~/utils/dashboards";
import { useDebounce } from "~/utils/debounce";

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
    dashboardData: dashboardConfig;
    dashboardLayout: Layouts;
};

const ResponsiveGridLayout = widthProvider(Responsive);

export const loader: LoaderFunction = async ({ request }) => {
    const user = await ensureAdmin(request, {
        failureRedirect: "/dashboard",
    });
    const dashboard = await getDefaultDashboardForUser(user);
    if (!dashboard.data) throw new Error("no dashboard!");
    // this is a known issue and is being tracked in https://github.com/prisma/prisma/issues/3219.
    // I have tried several workarounds to make typescript stop complaining and so far this
    // is the least bad one I have found. When support for typing JsonValues lands upstream
    // in prisma, this comment will become a FIXME.
    let newDash = dashboard;
    // @ts-expect-error FIXME: prisma does not allow you to type jsonVals...
    if (dashboard.data.data) {
        // @ts-expect-error FIXME: prisma does not allow you to type jsonVals...
        newDash = dashboard.data;
    }
    // @ts-expect-error FIXME: prisma does not allow you to type jsonVals...
    const dashboardData: dashboardConfig = newDash as breakPointsTo<dataItem[]>;
    return {
        totalCollected: await getTotalCollected(),
        chargesWithCustomers: await getRecentChargesWithCustomer(),
        chartData: perMonthToChartData(await amountPerMonth()),
        dashboardData,
        dashboardLayout: dashboardData.layouts,
    };
};

function getCurrentLayoutForDashboard(
    dashboard: dashboardConfig,
    breakpoints: {
        [lg: string]: number;
        md: number;
        sm: number;
        xs: number;
        xxs: number;
    }
): [Layout[], string] {
    const keys = Object.keys(breakpoints);
    const width = window.innerWidth;
    const sorted = keys.sort((a, b) => {
        return breakpoints[a] - breakpoints[b];
    });
    let [matching] = sorted;
    for (let i = 1, len = sorted.length; i < len; i++) {
        const breakpointName = sorted[i];
        if (width > breakpoints[breakpointName]) matching = breakpointName;
    }
    return [dashboard.layouts[matching], matching];
}

// Get associated data for a given item with id 'i' at breakpoint 'bp'
function getDataForCurrentLayoutItem(
    bp: string,
    i: string,
    dashboard: dashboardConfig
) {
    const data = dashboard.data[bp];
    for (const dataItem of data) {
        if (dataItem.i === i) return dataItem;
    }
}

export default function AdminIndex(): JSX.Element {
    const breakpoints = useMemo(() => {
        return { lg: 1280, md: 992, sm: 767, xs: 480, xxs: 0 };
    }, []);
    const fetcher = useFetcher();
    const [currentLayout, setCurrentLayout] = useState<Layout[]>();
    const [currentLayoutKey, setCurrentLayoutKey] = useState<string>("");
    const {
        chargesWithCustomers,
        chartData,
        totalCollected,
        dashboardData,
        dashboardLayout,
    } = useLoaderData<LoaderData>();
    const chargesWithMoney: ChargeWithCustomer[] = chargesWithCustomers.filter(
        (charge) => {
            if (charge.chargeAmount > 0) {
                return true;
            }
            return false;
        }
    );
    useEffect(() => {
        const [newData, newDataKey] = getCurrentLayoutForDashboard(
            dashboardData,
            breakpoints
        );
        setCurrentLayout(newData);
        setCurrentLayoutKey(newDataKey);
        window.addEventListener("resize", () => {
            const [newData, newDataKey] = getCurrentLayoutForDashboard(
                dashboardData,
                breakpoints
            );
            setCurrentLayout(newData);
            setCurrentLayoutKey(newDataKey);
        });
    }, [dashboardData, breakpoints, dashboardLayout]);
    return (
        <div className="h-full">
            <ResponsiveGridLayout
                className="layout"
                layouts={dashboardLayout}
                isDraggable
                width={800}
                isResizable
                isBounded
                breakpoints={breakpoints}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                onLayoutChange={(layout, layouts) => {
                    if (!dashboardData.id) return;
                    mergeLayoutsToDashboard(layouts, dashboardData);
                    fetcher.submit(
                        {
                            data: JSON.stringify(dashboardData),
                            id: dashboardData.id,
                        },
                        { method: "post", action: "/action/updateDashboard" }
                    );
                }}
            >
                {currentLayout?.map((val) => {
                    const data = getDataForCurrentLayoutItem(
                        currentLayoutKey,
                        val.i,
                        dashboardData
                    );
                    if (!data) return null;
                    return (
                        <div className="bg-gray-700 rounded" key={val.i}>
                            <DashboardItemRenderer
                                type={data?.type}
                                chartData={chartData}
                                financeData={{
                                    chargesWithMoney,
                                    totalCollected,
                                }}
                            />
                        </div>
                    );
                })}
            </ResponsiveGridLayout>
            <Outlet />
        </div>
    );
}
