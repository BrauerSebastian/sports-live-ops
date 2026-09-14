import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/legal/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "Privacy and analytics practices for the Sports Live Ops portfolio demonstration.",
};

export default function PrivacyPage() {
  return (
    <div className="public-view legal-view">
      <header className="public-header">
        <Link className="public-wordmark" href="/live">SPORTS LIVE OPS <span>/ LIVE CENTER</span></Link>
        <Link className="follow-button" href="/live">Back to Live Center</Link>
      </header>
      <main className="legal-page">
        <p className="overline">Legal / Privacy</p>
        <h1>Privacy policy</h1>
        <p className="legal-updated">Last updated: September 14, 2026</p>

        <section>
          <h2>What this site is</h2>
          <p>Sports Live Ops is a portfolio demonstration built with fictional sports data. It is not a commercial sports service and it does not sell personal information.</p>
        </section>

        <section>
          <h2>Necessary authentication data</h2>
          <p>The private Control Room uses an authentication session cookie so signed-in demo users can access authorized routes. This storage is necessary for the requested sign-in functionality and is not used for advertising.</p>
        </section>

        <section>
          <h2>Optional analytics</h2>
          <p>Analytics are disabled until you explicitly allow them in the privacy choices banner. When allowed, the application records first-party page-view paths and may report Core Web Vitals such as LCP, INP, CLS, FCP and TTFB for performance diagnostics. If a Google Analytics measurement ID is configured by the site operator, Google Analytics is also loaded only after analytics consent.</p>
        </section>

        <section>
          <h2>What the performance endpoint records</h2>
          <p>The application records the visited application path for page views. Performance records include the metric name, value, rating, navigation type and page path. The portfolio application does not intentionally attach names, email addresses or authentication credentials to these analytics records.</p>
        </section>

        <section>
          <h2>Local preferences</h2>
          <p>Your analytics choice is stored in localStorage under a versioned consent key. You can reopen Cookie settings from the public footer at any time to change that choice.</p>
        </section>

        <section>
          <h2>Demo credentials and submitted content</h2>
          <p>Do not enter real secrets or personal information into the demo. Editorial content, comments, match events and other Control Room data may be stored in the configured PostgreSQL database as part of the product demonstration.</p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>This repository is a portfolio project. For questions about the project, use the contact details supplied with the portfolio or repository that linked you here.</p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
