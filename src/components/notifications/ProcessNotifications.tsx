"use client";

import { useState } from "react";

export function ProcessNotifications() {
  const [message, setMessage] = useState("");
  async function process() { const response = await fetch("/api/notifications/process", { method: "POST" }); const data = await response.json(); setMessage(response.ok ? `${data.processed} pending notifications processed.` : data.error); }
  return <div className="process-control"><button className="secondary-button" onClick={process}>Process pending</button>{message && <span role="status">{message}</span>}</div>;
}
