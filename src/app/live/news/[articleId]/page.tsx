import Link from "next/link";
import { notFound } from "next/navigation";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getArticleById } from "@/lib/server/competition-repository";

export default async function PublicArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  let article;
  try { article = await getArticleById((await params).articleId, true); } catch { return <DataUnavailable title="News data unavailable" />; }
  if (!article) notFound();
  return <div className="public-view"><header className="public-header"><div className="public-wordmark">SPORTS LIVE OPS <span>/ LIVE CENTER</span></div><Link className="follow-button" href="/live">Back to Live Center</Link></header><main className="article-page"><p className="overline">{article.competition?.name ?? "North American League"} / News</p><h1>{article.title}</h1><p className="article-summary">{article.summary}</p><div className="article-meta">By {article.author.displayName} / {article.publishedAt?.toISOString().slice(0, 10)}</div><article>{article.body.split(/\n\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article></main></div>;
}
