import { Form } from "@remix-run/react";
import type { ReactChildren } from "react";
import React from "react";

type AttributeValue = string | number | readonly string[] | undefined;

type Props = {
    action: string;
    children: ReactChildren | string;
    params?: { key: string; value: AttributeValue }[];
    className?: string;
    disabled?: boolean;
    onSubmit?: React.FormEventHandler | undefined;
};

export default function ActionButton({
    action,
    children,
    params,
    className,
    disabled,
    onSubmit,
}: Props): JSX.Element {
    return (
        <Form method="post" onSubmit={onSubmit}>
            {params?.map((param) => {
                return (
                    <input
                        key={param.key + param.value}
                        type="text"
                        hidden
                        readOnly
                        name={param.key}
                        value={param.value}
                    />
                );
            })}
            <button
                disabled={disabled}
                type="submit"
                name="_action"
                value={action}
                className={className}
            >
                {children}
            </button>
        </Form>
    );
}
