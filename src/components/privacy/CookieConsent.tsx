"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const CONSENT_KEY = "sports-live-ops-consent";
export const CONSENT_EVENT = "sports-live-ops:consent";
export const CONSENT_RESET_EVENT = "sports-live-ops:consent-reset";
export type ConsentChoice = { version: 1; necessary: true; analytics: boolean };

function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
    if (parsed.version !== 1 || parsed.necessary !== true || typeof parsed.analytics !== "boolean") return null;
    return parsed as ConsentChoice;
  } catch {
    return null;
  }
}

function storeConsent(analytics: boolean) {
  const choice: ConsentChoice = { version: 1, necessary: true, analytics };
  window.localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(!readConsent()), 0);
    const reopen = () => setVisible(true);
    window.addEventListener(CONSENT_RESET_EVENT, reopen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_RESET_EVENT, reopen);
    };
  }, []);

  if (!visible) return null;

  return (
    <aside className="cookie-banner" aria-label="Cookie preferences" role="dialog" aria-live="polite">
      <div>
        <strong>Privacy choices</strong>
        <p>
          Sports Live Ops uses necessary authentication storage for the Control Room.
          Optional analytics and Core Web Vitals run only if you allow them.{" "}
          <Link href="/privacy">Privacy policy</Link>
        </p>
      </div>
      <div className="cookie-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            storeConsent(false);
            setVisible(false);
          }}
        >
          Necessary only
        </button>
        <button
          type="button"
          className="publish-button"
          onClick={() => {
            storeConsent(true);
            setVisible(false);
          }}
        >
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
