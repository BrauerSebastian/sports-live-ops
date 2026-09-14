import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getArticleById } from "@/lib/server/competition-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ articleId: string }> }): Promise<Metadata> {
  try {
    const article = await getArticleById((await params).articleId, true);
    if (!article) return { title: "Article not found" };
    return {
      title: article.title,
      description: article.summary,
      alternates: { canonical: `/live/news/${article.id}` },
      openGraph: { type: "article", title: article.title, description: article.summary, publishedTime: article.publishedAt?.toISOString() },
    };
  } catch {
    return { title: "Competition news" };
  }
}

export default async function PublicArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  let article;
  try { article = await getArticleById((await params).articleId, true); } catch { return <DataUnavailable title="News data unavailable" />; }
  if (!article) notFound();

  return (
    <main className="article-page">
      <div className="article-breadcrumb"><Link href="/live">Live Center</Link><span>/</span><span>News</span></div>
      <p className="overline">{article.competition?.name ?? "Competition news"}</p>
      <h1>{article.title}</h1>
      <p className="article-summary">{article.summary}</p>
      <div className="article-meta">By {article.author.displayName} / {article.publishedAt?.toISOString().slice(0, 10)}</div>
      <article>{article.body.split(/\n\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>
    </main>
  );
}
