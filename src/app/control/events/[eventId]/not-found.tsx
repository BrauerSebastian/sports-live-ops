import Link from "next/link";

export default function ControlEventNotFound() { return <main className="system-state-page"><span className="overline">Control Room</span><h1>Event not found</h1><p>The requested fixture does not exist in the current competition.</p><Link className="secondary-button" href="/control/events">Return to events</Link></main>; }
