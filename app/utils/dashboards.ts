import type { Layout, Layouts } from "react-grid-layout";

export enum cardType {
    UNKNOWN = "u",
    CHARGECHART = "cc",
    FINANCEOVERVIEW = "fo"
}

// Typescript representation of react-grid-layout item type
export type dashItem = {
    w: number,
    h: number,
    x: number,
    y: number,
    i: string,
    type: cardType
}

export type dataItem = {
    i: string
    type: cardType
}

// Used to map each breakpoint to arbitrary data. This ensures that when constructing
// a dashboard with arbitrary data we can be sure we will have accounted for all breakpoints
export type breakPointsTo<K> = {
    [key: string]: K
    lg: K,
    md: K,
    sm: K,
    xs: K,
    xxs: K
}

// Shortcut to default breakpoint structure
export type Breakpoints = breakPointsTo<number>

export type dashboardConfig = {
    id?: string; // FIXME: id really should be mandatory... This will require generating id outside of DB
    layouts: breakPointsTo<Layout[]>;
    data: breakPointsTo<dataItem[]>
}

export function mergeLayoutsToDashboard(layouts: Layouts, data: dashboardConfig): void {
    data.layouts = layouts as breakPointsTo<Layout[]>
}

// Default dashboard layout, this is constructed when the user attempts to load a dashboard for the first time
export const defaultDash: dashboardConfig = {
    id: "default",
    data: {
        lg: [
            {
                i: "card1",
                type: cardType.CHARGECHART,
            },
            {
                i: "card2",
                type: cardType.FINANCEOVERVIEW,
            },
            {
                i: "card3",
                type: cardType.UNKNOWN,
            },
        ],
        md: [
            {
                i: "card1",
                type: cardType.CHARGECHART,
            },
            {
                i: "card2",
                type: cardType.FINANCEOVERVIEW,
            },
            {
                i: "card3",
                type: cardType.UNKNOWN,
            },
        ],
        sm: [
            {
                i: "card1",
                type: cardType.CHARGECHART,
            },
            {
                i: "card2",
                type: cardType.FINANCEOVERVIEW,
            },
            {
                i: "card3",
                type: cardType.UNKNOWN,
            },
        ],
        xs: [
            {
                i: "card1",
                type: cardType.CHARGECHART,
            },
            {
                i: "card2",
                type: cardType.FINANCEOVERVIEW,
            },
            {
                i: "card3",
                type: cardType.UNKNOWN,
            },
        ],
        xxs: [
            {
                i: "card1",
                type: cardType.CHARGECHART,
            },
            {
                i: "card2",
                type: cardType.FINANCEOVERVIEW,
            },
            {
                i: "card3",
                type: cardType.UNKNOWN,
            },
        ],
    },
    layouts: {
        lg: [
            {
                w: 8,
                h: 2,
                x: 0,
                y: 0,
                i: "card1",
            },
            {
                w: 4,
                h: 2,
                x: 8,
                y: 0,
                i: "card2",
            },
            {
                w: 5,
                h: 2,
                x: 0,
                y: 0,
                i: "card3",
            },
        ],
        md: [
            {
                w: 6,
                h: 2,
                x: 0,
                y: 0,
                i: "card1",
            },
            {
                w: 4,
                h: 2,
                x: 6,
                y: 0,
                i: "card2",
            },
            {
                w: 3,
                h: 2,
                x: 0,
                y: 0,
                i: "card3",
            },
        ],
        sm: [
            {
                w: 6,
                h: 2,
                x: 0,
                y: 0,
                i: "card1",
            },
            {
                w: 3,
                h: 2,
                x: 0,
                y: 0,
                i: "card2",
            },
            {
                w: 3,
                h: 2,
                x: 3,
                y: 0,
                i: "card3",
            },
        ],
        xs: [
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "card1",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "card2",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "card3",
            },
        ],
        xxs: [
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "card1",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "card2",
            },
            {
                w: 4,
                h: 2,
                x: 0,
                y: 0,
                i: "card3",
            },
        ],
    }
};
