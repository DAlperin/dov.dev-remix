import { useEffect } from "react";

import { usePreviewSubscription } from "~/hooks/usePreviewSubscription";

export default function Preview({
    data,
    setData,
    query,
    queryParams,
}: {
    /* eslint-disable */
    data: any;
    queryParams: Record<string, unknown>;
    setData: any;
    query: string;
    /* eslint-enable */
}): JSX.Element {
    const { data: previewData } = usePreviewSubscription(query, {
        params: queryParams,
        initialData: data,
    });

    useEffect(() => {
        setData(previewData);
    }, [previewData, setData]);

    return <div>Preview Mode</div>;
}
