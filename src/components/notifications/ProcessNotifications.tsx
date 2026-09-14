"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ProcessNotifications() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function process() {
    if (pending) return;
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/notifications/process", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Notifications could not be processed.");
      setMessage(`${data.processed} pending notifications processed.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notifications could not be processed.");
    } finally { setPending(false); }
  }
  return <div className="process-control"><button disabled={pending} className="secondary-button" onClick={process}>{pending ? "Processing..." : "Process pending"}</button>{message && <span role="status">{message}</span>}</div>;
}
