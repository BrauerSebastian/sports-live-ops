"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Article = { id?: string; slug: string; title: string; summary: string; body: string; status: "DRAFT" | "PUBLISHED"; competitionId?: string | null; eventId?: string | null };
type Option = { id: string; label: string; competitionId?: string };

export function ArticleEditor({ article, competitions = [], events = [] }: { article?: Article; competitions?: Option[]; events?: Option[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Article>(article ?? { slug: "", title: "", summary: "", body: "", status: "DRAFT", competitionId: null, eventId: null });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const filteredEvents = useMemo(() => form.competitionId ? events.filter((event) => event.competitionId === form.competitionId) : events, [events, form.competitionId]);

  function update(field: keyof Article, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  async function save(status: Article["status"]) {
    if (pending) return;
    setPending(true); setMessage(""); setError("");
    try {
      const response = await fetch(form.id ? `/api/content/${form.id}` : "/api/content", { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, status }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "The article could not be saved.");
      setForm((current) => ({ ...current, id: payload.article.id, status }));
      setMessage(status === "PUBLISHED" ? "Article published." : "Draft saved.");
      if (!form.id) router.replace(`/control/content/${payload.article.id}`);
      else router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The article could not be saved.");
    } finally { setPending(false); }
  }

  return <main className="route-page"><header className="route-heading"><div><p className="overline">Control Room / Publishing</p><h1>{form.id ? "Edit article" : "New article"}</h1><p>Draft content stays private until explicitly published.</p></div></header><section className="editor-layout"><div className="editor-form"><label>Slug<input disabled={pending} value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="matchday-eight-preview" /></label><label>Title<input disabled={pending} value={form.title} onChange={(event) => update("title", event.target.value)} /></label><label>Competition<select disabled={pending} value={form.competitionId ?? ""} onChange={(event) => { const competitionId = event.target.value || null; setForm((current) => ({ ...current, competitionId, eventId: current.eventId && events.some((option) => option.id === current.eventId && (!competitionId || option.competitionId === competitionId)) ? current.eventId : null })); }}><option value="">No competition</option>{competitions.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label><label>Event<select disabled={pending} value={form.eventId ?? ""} onChange={(event) => setForm((current) => ({ ...current, eventId: event.target.value || null }))}><option value="">No event</option>{filteredEvents.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label><label>Summary<textarea disabled={pending} value={form.summary} onChange={(event) => update("summary", event.target.value)} /></label><label>Body<textarea disabled={pending} className="body-editor" value={form.body} onChange={(event) => update("body", event.target.value)} /></label><div className="editor-actions"><button disabled={pending} className="secondary-button" onClick={() => save("DRAFT")}>{pending ? "Saving..." : "Save draft"}</button><button disabled={pending} className="publish-button" onClick={() => save("PUBLISHED")}>{pending ? "Saving..." : "Publish"}</button></div>{message && <p className="editor-message" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}</div><aside className="editor-notes"><span className="overline">Publishing rules</span><p>Published articles appear on the public Live Center. Drafts remain available only to authorized editors.</p><p>Associating an event automatically constrains it to the selected competition when one is chosen.</p></aside></section></main>;
}
