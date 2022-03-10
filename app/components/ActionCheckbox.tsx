import { Form, useSubmit } from "@remix-run/react";
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
    const submit = useSubmit();
    return (
        <Form
            method="post"
            onSubmit={onSubmit}
            onChange={(event) => {
                submit(event.currentTarget, { replace: true });
            }}
        >
            <input hidden type="text" name="_action" value={action} readOnly />
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
            <input
                disabled={disabled}
                type="checkbox"
                name={name}
                defaultChecked={initialValue}
                className={className}
            />
        </Form>
    );
}
