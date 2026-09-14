import { NextResponse } from "next/server";
import { canEditContent, articleInput, saveArticle, serializeContentError } from "@/lib/server/content-service";
import { getCurrentUser } from "@/lib/server/require-user";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!canEditContent(user.role)) return NextResponse.json({ error: "You cannot edit content." }, { status: 403 });
  try {
    const input = articleInput.parse(await request.json());
    return NextResponse.json({ article: await saveArticle(undefined, user.id, input) }, { status: 201 });
  } catch (error) {
    const result = serializeContentError(error);
    return NextResponse.json({ error: result.message, issues: "issues" in result ? result.issues : undefined }, { status: result.status });
  }
}
