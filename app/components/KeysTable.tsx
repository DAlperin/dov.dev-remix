import type { registrationSecret } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { AnimatePresence, motion } from "framer-motion";

import ActionButton from "~/components/ActionButton";
import ActionCheckbox from "~/components/ActionCheckbox";

type Props = {
    newKey: SerializeFrom<registrationSecret> | null;
    keys: SerializeFrom<registrationSecret[]>;
    CurrentlyInvalidating: string;
    setCurrentlyInvalidating: React.Dispatch<React.SetStateAction<string>>;
};

export default function KeysTable({
    keys,
    CurrentlyInvalidating,
    setCurrentlyInvalidating,
    newKey,
}: Props): JSX.Element {
    return (
        <div className="w-full">
            <div className="table w-full border-separate [border-spacing:0.75rem]">
                <div className="table-header-group">
                    <div className="table-cell text-left ...">key</div>
                    <div className="table-cell text-left ...">admin</div>
                    <div className="table-cell text-left ...">options</div>
                </div>
                <div className="table-row-group">
                    <AnimatePresence>
                        {keys.map((key: SerializeFrom<registrationSecret>) => {
                            return (
                                <motion.div
                                    exit={{ opacity: 0 }}
                                    key={key.key}
                                    className={`table-row w-full ${
                                        newKey?.key === key.key
                                            ? "text-green-700 animate_fadeInTop"
                                            : ""
                                    }`}
                                >
                                    <div className="table-cell">{key.key}</div>
                                    <div className="table-cell">
                                        <ActionCheckbox
                                            action="setAdmin"
                                            name="admin"
                                            initialValue={key.admin}
                                            params={[
                                                {
                                                    key: "key",
                                                    value: key.key,
                                                },
                                            ]}
                                        />
                                    </div>
                                    <div className="table-cell">
                                        <ActionButton
                                            className="bg-gray-500 hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400 text-white font-bold py-1 px-1 max-w-1 rounded cursor-pointer"
                                            action="invalidate"
                                            onSubmit={() => {
                                                setCurrentlyInvalidating(
                                                    key.key
                                                );
                                            }}
                                            params={[
                                                {
                                                    key: "key",
                                                    value: key.key,
                                                },
                                            ]}
                                        >
                                            {CurrentlyInvalidating === key.key
                                                ? "Loading..."
                                                : "Invalidate"}
                                        </ActionButton>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
