import Script from "next/script";

/** Loads the optional MISTNET interaction runtime after the page becomes interactive. */
export function MistnetScripts() {
  return <Script src="/mistnet-runtime.js" strategy="afterInteractive" />;
}
