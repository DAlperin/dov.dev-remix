import { useFetcher } from "remix";

export function NewsletterForm({
    title = "Subscribe to the newsletter",
}: {
    title: string;
}): JSX.Element {
    const fetcher = useFetcher();

    if (fetcher.type === "done" && fetcher.data.ok) {
        return (
            <div>
                <div className="pb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {title}
                </div>
                You're subscribed! 🎉
            </div>
        );
        // eslint-disable-next-line sonarjs/elseif-without-else
    } else if (fetcher.type === "done" && fetcher.data.error) {
        return (
            <div>
                <div className="pb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {title}
                </div>
                There was an error subscribing: {fetcher.data.error}
            </div>
        );
    }
    return (
        <div>
            <div className="pb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
                {title}
            </div>
            <fetcher.Form
                method="post"
                action="/action/subscribe"
                className="flex flex-col sm:flex-row"
            >
                <div className="flex-1">
                    <label className="sr-only" htmlFor="email-input">
                        Email address
                    </label>
                    <input
                        aria-label="Email Address"
                        autoComplete="email"
                        className="px-4 py-2 w-full rounded-md dark:bg-black focus:outline-none focus:ring-2 focus:border-transparent focus:ring-primary-600"
                        id="email-input"
                        name="email"
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="flex w-30 flex-initial mt-2 rounded-md shadow-sm sm:mt-0 sm:ml-3">
                    <button
                        aria-label="Subscribe button"
                        className="py-2 sm:py-0 w-full bg-primary-500 px-4 rounded-md font-medium text-white hover:bg-primary-700 dark:hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 dark:ring-offset-black"
                        type="submit"
                    >
                        Sign up!
                    </button>
                </div>
            </fetcher.Form>
        </div>
    );
}

export function BlogNewsletterForm({ title }: { title: string }): JSX.Element {
    return (
        <div className="mt-4 flex items-center justify-center">
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-md">
                <NewsletterForm title={title} />
            </div>
        </div>
    );
}
