"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { CONSENT_EVENT, CONSENT_KEY, type ConsentChoice } from "@/components/privacy/CookieConsent";

function currentConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentChoice) : null;
  } catch {
    return null;
  }
}

export function ConsentAnalytics() {
  const pathname = usePathname();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    const timer = window.setTimeout(() => setAnalyticsAllowed(currentConsent()?.analytics === true), 0);
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<ConsentChoice>).detail;
      setAnalyticsAllowed(detail?.analytics === true);
    };
    window.addEventListener(CONSENT_EVENT, listener);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, listener);
    };
  }, []);

  const reportVitals = useCallback((metric: { id: string; name: string; value: number; rating?: string; navigationType?: string }) => {
    if (!analyticsAllowed) return;
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      path: window.location.pathname,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/vitals", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/analytics/vitals", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  }, [analyticsAllowed]);

  useReportWebVitals(reportVitals);

  useEffect(() => {
    if (!analyticsAllowed) return;

    const body = JSON.stringify({ path: pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/pageview", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/analytics/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }

    if (measurementId && window.gtag) window.gtag("config", measurementId, { page_path: pathname });
  }, [analyticsAllowed, measurementId, pathname]);

  if (!analyticsAllowed || !measurementId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="sports-live-ops-ga" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
