"use client";

import { CONSENT_KEY, CONSENT_RESET_EVENT } from "@/components/privacy/CookieConsent";

export function ConsentPreferencesButton() {
  return (
    <button
      type="button"
      className="footer-link-button"
      onClick={() => {
        window.localStorage.removeItem(CONSENT_KEY);
        window.dispatchEvent(new Event(CONSENT_RESET_EVENT));
      }}
    >
      Cookie settings
    </button>
  );
}
