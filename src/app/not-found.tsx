import Link from "next/link";

export default function NotFound() {
  return <main className="system-state-page"><span className="overline">404</span><h1>That page does not exist.</h1><p>The requested competition, event, article, or workspace route could not be found.</p><div className="editor-actions"><Link className="secondary-button" href="/live">Live Center</Link><Link className="secondary-button" href="/control">Control Room</Link></div></main>;
}
