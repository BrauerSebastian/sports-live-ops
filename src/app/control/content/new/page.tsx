import { ArticleEditor } from "@/components/content/ArticleEditor";
import { getCompetitions, getEvents } from "@/lib/server/competition-repository";

export default async function NewContentPage() { const [competitions, events] = await Promise.all([getCompetitions(), getEvents()]); return <ArticleEditor competitions={competitions.map((item) => ({ id: item.id, label: item.name }))} events={events.map((item) => ({ id: item.id, label: item.title, competitionId: item.competitionId }))} />; }
