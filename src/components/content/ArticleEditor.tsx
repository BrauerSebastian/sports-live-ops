"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Article = { id?: string; slug: string; title: string; summary: string; body: string; status: "DRAFT" | "PUBLISHED" };

export function ArticleEditor({ article }: { article?: Article }) {
  const router = useRouter();
  const [form, setForm] = useState<Article>(article ?? { slug: "", title: "", summary: "", body: "", status: "DRAFT" });
  const [message, setMessage] = useState("");
  function update(field: keyof Article, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  async function save(status: Article["status"]) { const response = await fetch(form.id ? `/api/content/${form.id}` : "/api/content", { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, status }) }); if (response.ok) { setMessage(status === "PUBLISHED" ? "Article published." : "Draft saved."); router.refresh(); } else setMessage("The article could not be saved."); }
  return <main className="route-page"><header className="route-heading"><div><p className="overline">Control Room / Publishing</p><h1>{form.id ? "Edit article" : "New article"}</h1><p>Draft content stays private until explicitly published.</p></div></header><section className="editor-layout"><div className="editor-form"><label>Slug<input value={form.slug} onChange={(event) => update("slug", event.target.value)} placeholder="matchday-eight-preview" /></label><label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} /></label><label>Summary<textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} /></label><label>Body<textarea className="body-editor" value={form.body} onChange={(event) => update("body", event.target.value)} /></label><div className="editor-actions"><button className="secondary-button" onClick={() => save("DRAFT")}>Save draft</button><button className="publish-button" onClick={() => save("PUBLISHED")}>Publish</button></div>{message && <p className="editor-message" role="status">{message}</p>}</div><aside className="editor-notes"><span className="overline">Publishing rules</span><p>Published articles appear on the public Live Center. Drafts remain available only to authorized editors.</p></aside></section></main>;
}
