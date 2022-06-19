import { RemixBrowser } from "@remix-run/react";
import { load } from "fathom-client";
import { hydrate } from "react-dom";

hydrate(<RemixBrowser />, document);

load("YXSYHQER", {
    url: "https://thirtyeight-stupendous.d0va1p.net/script.js",
    spa: "history",
    excludedDomains: ["localhost"],
});
