"use client";

import Link from "next/link";

export default function LiveError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="system-state-page"><span className="overline">Live Center</span><h1>Live data could not be loaded.</h1><p>The public feed is temporarily unavailable. Retry the request or return to the Live Center.</p><div className="editor-actions"><button className="secondary-button" onClick={reset}>Retry</button><Link className="secondary-button" href="/live">Live Center</Link></div></main>;
}
