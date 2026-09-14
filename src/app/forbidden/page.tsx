import Link from "next/link";

export default function ForbiddenPage() { return <main className="system-state-page"><span className="overline">Access control</span><h1>That workspace is not available to this role.</h1><p>Use an account with the required operational or editorial permission.</p><Link className="secondary-button" href="/live">Return to Live Center</Link></main>; }
