"use client";

import Link from "next/link";

export default function ControlError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="system-state-page"><span className="overline">Control Room</span><h1>Operations data could not be loaded.</h1><p>The request failed before this workspace could be rendered. Retry once; if the problem persists, verify the database and local environment.</p><div className="editor-actions"><button className="secondary-button" onClick={reset}>Retry</button><Link className="secondary-button" href="/control">Overview</Link></div></main>;
}
