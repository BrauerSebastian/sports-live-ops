import { NextResponse } from "next/server";
import { canEditContent, articleInput, saveArticle, serializeContentError } from "@/lib/server/content-service";
import { getCurrentUser } from "@/lib/server/require-user";

export async function PATCH(request: Request, { params }: { params: Promise<{ articleId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!canEditContent(user.role)) return NextResponse.json({ error: "You cannot edit content." }, { status: 403 });
  try {
    const input = articleInput.parse(await request.json());
    return NextResponse.json({ article: await saveArticle((await params).articleId, user.id, input) });
  } catch (error) {
    const result = serializeContentError(error);
    return NextResponse.json({ error: result.message, issues: "issues" in result ? result.issues : undefined }, { status: result.status });
  }
}
