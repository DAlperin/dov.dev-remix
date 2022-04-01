import { useFetcher } from "@remix-run/react";
import React from "react";

type AttributeValue = string | number | readonly string[] | undefined;

type Props = {
    action: string;
    name: string;
    className?: string;
    disabled?: boolean;
    initialValue: boolean;
    params?: { key: string; value: AttributeValue }[];
    onSubmit?: React.FormEventHandler | undefined;
};

export default function ActionCheckbox({
    name,
    action,
    className,
    disabled,
    onSubmit,
    initialValue,
    params,
}: Props): JSX.Element {
    const fetcher = useFetcher();
    return (
        <fetcher.Form
            method="post"
            onSubmit={onSubmit}
            onChange={(event) => {
                fetcher.submit(event.currentTarget, { replace: true });
            }}
        >
            <input
                hidden
                type="text"
                name="_action"
                value={action}
                aria-hidden
                readOnly
            />
            {params?.map((param) => {
                if (param.value) {
                    return (
                        <input
                            key={`${param.key} ${param.value?.toString()}`}
                            aria-hidden
                            type="text"
                            hidden
                            readOnly
                            name={param.key}
                            value={param.value}
                        />
                    );
                }
            })}
            <input
                disabled={disabled}
                aria-label="checkbox"
                type="checkbox"
                name={name}
                defaultChecked={initialValue}
                className={className}
            />
        </fetcher.Form>
    );
}
