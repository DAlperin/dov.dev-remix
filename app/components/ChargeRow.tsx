import type { CSSProperties } from "react";
import type { Stripe } from "stripe";

import type { ChargeWithCustomer } from "~/services/stripe.server";
import { usdFormatter } from "~/utils/formatter";

type Props = {
    index: number;
    style: CSSProperties | undefined;
    charges: ChargeWithCustomer[];
};
export default function ChargeRow({
    index,
    style,
    charges,
}: Props): JSX.Element | null {
    const charge: ChargeWithCustomer = charges[index];
    let deleted = false;
    let customer: Stripe.Customer | undefined;
    let customerName = "unknown";

    // @ts-expect-error FIXME: there has to be a more elegant way to deal with this API
    if (charge.customer.deleted) {
        deleted = true;
        customerName = "deleted";
    } else {
        // @ts-expect-error see above
        ({ customer } = charge);
    }

    if (customer?.name) {
        customerName = customer.name;
    }
    return (
        <div style={style} key={index}>
            <p className="my-0 text-lg">
                {usdFormatter.format(charge?.chargeAmount)}
            </p>
            <div className="flex flex-row my-0 ml-1 text-xs">
                {customer?.id ? (
                    <a
                        className={`flex-1 text-blue-200 hover:text-blue-300 ${
                            deleted ? "opacity-60" : ""
                        }`}
                        href={`https://dashboard.stripe.com/customers/${customer?.id}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {customerName}
                    </a>
                ) : (
                    <p className="flex-1 m-0">{customerName}</p>
                )}
                <div className="mr-2">
                    {charge.receiptUrl ? (
                        <a
                            className="text-blue-200 hover:text-blue-300"
                            target="_blank"
                            href={charge.receiptUrl}
                            rel="noreferrer"
                        >
                            View receipt
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
