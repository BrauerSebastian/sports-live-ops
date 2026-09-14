"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("operator@sports-live-ops.test");
  const [password, setPassword] = useState("ChangeMe-Portfolio-2026");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const result = await signIn("credentials", { email: email.trim(), password, website, redirect: false });
    if (result?.error) setError("Credentials were not accepted. Repeated failed attempts are temporarily rate limited.");
    else router.push("/control");
    setPending(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand"><strong>Sports Live Ops</strong></div>
        <p className="overline">Control Room</p>
        <h1>Sign in</h1>
        <p className="auth-copy">Access match operations, publishing and system tools.</p>
        <form onSubmit={submit} className="auth-form" noValidate={false}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              inputMode="email"
              maxLength={320}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              minLength={8}
              maxLength={200}
              required
            />
          </label>
          <label className="form-honeypot" aria-hidden="true">
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="publish-button" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="demo-note">Seeded operator, editor, and admin accounts are listed in the README.</p>
      </section>
    </main>
  );
}
