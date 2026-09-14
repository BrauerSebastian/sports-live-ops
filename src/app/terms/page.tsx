import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/legal/PublicFooter";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Terms for using the Sports Live Ops portfolio demonstration.",
};

export default function TermsPage() {
  return (
    <div className="public-view legal-view">
      <header className="public-header">
        <Link className="public-wordmark" href="/live"><strong>Sports Live Ops</strong><span>Live Center</span></Link>
        <Link className="follow-button" href="/live">Back to Live Center</Link>
      </header>
      <main className="legal-page">
        <p className="overline">Legal / Terms</p>
        <h1>Terms and conditions</h1>
        <p className="legal-updated">Last updated: September 14, 2026</p>

        <section>
          <h2>Portfolio demonstration</h2>
          <p>Sports Live Ops is provided as a software portfolio demonstration. Competitions, teams, venues, events, articles and statistics in the seeded experience are fictional.</p>
        </section>

        <section>
          <h2>No production service commitment</h2>
          <p>The application is provided without service-level guarantees. Availability, live updates, notification simulation and stored demonstration data may change while the project is being developed or evaluated.</p>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <p>Do not use the demo to upload unlawful material, probe accounts you do not control, interfere with the service, attempt to bypass authorization controls, or enter real confidential credentials or personal data.</p>
        </section>

        <section>
          <h2>Demo accounts</h2>
          <p>Seeded accounts exist only to demonstrate role-based workflows. They are not intended to protect sensitive production data. A real deployment must replace demo credentials and apply environment-specific security controls.</p>
        </section>

        <section>
          <h2>Intellectual property</h2>
          <p>The application design and implementation are original portfolio work. Third-party libraries remain subject to their own licenses. No affiliation with real sports organizations is implied.</p>
        </section>

        <section>
          <h2>External services</h2>
          <p>If optional analytics are enabled by the site operator and accepted by you, those services may also be governed by their own terms and privacy notices.</p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
