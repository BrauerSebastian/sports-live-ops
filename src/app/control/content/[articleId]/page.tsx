import { notFound } from "next/navigation";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { ArticleEditor } from "@/components/content/ArticleEditor";
import { getArticleById } from "@/lib/server/competition-repository";

export default async function EditContentPage({ params }: { params: Promise<{ articleId: string }> }) {
  let article;
  try { article = await getArticleById((await params).articleId); } catch { return <DataUnavailable title="Article data unavailable" />; }
  if (!article) notFound();
  return <ArticleEditor article={{ id: article.id, slug: article.slug, title: article.title, summary: article.summary, body: article.body, status: article.status }} />;
}
