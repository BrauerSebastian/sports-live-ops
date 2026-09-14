import { NextResponse } from "next/server";
import { canEditContent, articleInput, saveArticle } from "@/lib/server/content-service";
import { getCurrentUser } from "@/lib/server/require-user";

export async function PATCH(request: Request, { params }: { params: Promise<{ articleId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!canEditContent(user.role)) return NextResponse.json({ error: "You cannot edit content." }, { status: 403 });
  const parsed = articleInput.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "The article data is invalid.", issues: parsed.error.issues }, { status: 400 });
  try { return NextResponse.json({ article: await saveArticle((await params).articleId, user.id, parsed.data) }); }
  catch { return NextResponse.json({ error: "The article could not be saved." }, { status: 500 }); }
}
