"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("operator@sports-live-ops.test");
  const [password, setPassword] = useState("ChangeMe-Portfolio-2026");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) setError("Credentials were not accepted.");
    else router.push("/control");
    setPending(false);
  }

  return <main className="auth-page"><section className="auth-panel"><div className="auth-brand"><span className="wordmark-mark">S</span><strong>SPORTS LIVE OPS</strong></div><p className="overline">Control Room access</p><h1>Sign in to operations</h1><p className="auth-copy">Use a demo operator account to manage the fictional North American League.</p><form onSubmit={submit} className="auth-form"><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="publish-button" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button></form><p className="demo-note">Demo roles: operator, editor, and admin accounts are documented in the README.</p></section></main>;
}

