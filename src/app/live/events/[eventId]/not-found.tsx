import Link from "next/link";

export default function PublicEventNotFound() { return <main className="system-state-page"><span className="overline">Live Center</span><h1>Event not found</h1><p>This fixture is not available or is no longer published.</p><Link className="secondary-button" href="/live">Return to Live Center</Link></main>; }
