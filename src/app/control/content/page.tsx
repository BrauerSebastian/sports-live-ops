import Link from "next/link";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getEditorialArticles } from "@/lib/server/competition-repository";

export default async function ContentPage() {
  let articles;
  try { articles = await getEditorialArticles(); } catch { return <DataUnavailable title="Editorial data unavailable" />; }
  return <main className="route-page"><header className="route-heading"><div><p className="overline">Control Room / Publishing</p><h1>Content</h1><p>Draft and publish competition stories for Live Center.</p></div><Link className="secondary-button" href="/control/content/new">New article</Link></header><section className="route-section event-table event-table--content"><div className="event-table-head"><span>Article</span><span>Status</span><span>Author</span><span>Updated</span><span /></div>{articles.length ? articles.map((article) => <Link className="event-table-row" href={`/control/content/${article.id}`} key={article.id}><span><strong>{article.title}</strong><small>{article.summary}</small></span><span className={`status-text ${article.status.toLowerCase()}`}>{article.status}</span><span className="event-meta">{article.author.displayName}</span><span className="event-meta">{article.updatedAt.toISOString().slice(0, 10)}</span><span className="row-action">Edit</span></Link>) : <p className="route-empty">No articles have been created yet.</p>}</section></main>;
}
