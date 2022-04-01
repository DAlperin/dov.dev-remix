import Stripe from "stripe";

import { cache } from "~/services/cache.server";

// @ts-expect-error assume we have STRIPE_KEY
const stripe = new Stripe(process.env.STRIPE_KEY, {});

export async function getBalanceTransactions(): Promise<
    Stripe.Response<Stripe.ApiList<Stripe.BalanceTransaction>>
> {
    return stripe.balanceTransactions.list({
        limit: 100,
    });
}

async function updateCharges() {
    const charges = await stripe.charges.list({
        limit: 100,
    });
    await cache.redis.set("stripeCharges", JSON.stringify(charges), "EX", 120)
}

export async function getAccountCharges(): Promise<
    Stripe.Response<Stripe.ApiList<Stripe.Charge>>
> {
    const cached = await cache.redis.get("stripeCharges")
    const ttl = await cache.redis.ttl("stripeCharges")
    if (ttl < 60) {
        void updateCharges()
    }
    if (cached) { return JSON.parse(cached) }

    const charges = await stripe.charges.list({
        limit: 100,
    });
    await cache.redis.set("stripeCharges", JSON.stringify(charges), "EX", 120)
    return charges

}

export async function getTotalCollected(): Promise<number> {
    let totalCollected = 0;
    const accountCharges = await getAccountCharges();
    for (const charge of accountCharges.data) {
        const captured = charge.amount_captured
        if (captured > 0) {
            const net = captured;
            totalCollected += net / 100;
        }
    }
    return totalCollected;
}

export type ChargeWithCustomer = {
    customer: Stripe.Customer | Stripe.DeletedCustomer | Promise<Stripe.Customer | Stripe.DeletedCustomer>;
    chargeAmount: number;
    receiptUrl: string | undefined;
};

export function totalCollectedForCharge(charge: Stripe.Charge): number {
    return charge.amount_captured / 100;
}

export async function getCustomerForID(
    id: string
): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return stripe.customers.retrieve(id);
}

export async function getRecentChargesWithCustomer(): Promise<
    ChargeWithCustomer[]
> {
    const results: ChargeWithCustomer[] = [];
    const charges = await getAccountCharges();
    let fullCache = true
    for (const charge of charges.data) {
        let customer: Stripe.Customer | Stripe.DeletedCustomer | undefined;
        if (typeof charge.customer === "string") {
            // eslint-disable-next-line no-await-in-loop
            const cached = await cache.redis.get(`customer:${charge.customer}`)
            if (cached) {
                customer = JSON.parse(cached)
            } else {
                fullCache = false
            }

            results.push({
                chargeAmount: totalCollectedForCharge(charge),
                customer: customer ?? stripe.customers.retrieve(charge.customer),
                receiptUrl: charge.receipt_url ? charge.receipt_url : undefined,
            });
        }
    }
    if (fullCache) return results
    return Promise.all(results.map(async (item) => {
        const customer = await item.customer
        void cache.redis.set(`customer:${customer.id}`, JSON.stringify(customer), "EX", 300)
        return {
            ...item,
            customer
        }
    }))

}

export const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function monthDiff(d1: Date, d2: Date): number {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

export async function amountPerMonth(): Promise<Map<string, number>> {
    const result = new Map<string, number>();
    const today = new Date(Date.now());
    const charges = await getAccountCharges();
    for (const charge of charges.data) {
        const date = new Date(charge.created * 1000);
        if (monthDiff(date, today) > 12) {
            continue;
        }
        const rawMonth = date.getMonth();
        const month = months[rawMonth];
        const prev = result.get(month) ?? 0;
        result.set(month, prev + charge.amount_captured / 100);
    }
    for (const month of months) {
        if (!result.get(month)) {
            result.set(month, 0);
        }
    }
    return result;
}

export type RechartsItem = {
    name: string;
    value: number;
};

export function perMonthToChartData(data: Map<string, number>): RechartsItem[] {
    const result: RechartsItem[] = [];
    for (const month of data) {
        result.push({
            name: month[0],
            value: month[1],
        });
    }
    result.sort((a, b) => {
        return months.indexOf(a.name) - months.indexOf(b.name);
    });
    return result;
}
