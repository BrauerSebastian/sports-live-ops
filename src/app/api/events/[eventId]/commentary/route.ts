import { NextResponse } from "next/server";
import { canPublishCommentary, commentaryInput, publishCommentary, serializeServiceError } from "@/lib/server/event-service";
import { getCurrentUser } from "@/lib/server/require-user";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!canPublishCommentary(user.role)) return NextResponse.json({ error: "You cannot publish commentary." }, { status: 403 });
  try {
    const input = commentaryInput.parse(await request.json());
    const { eventId } = await params;
    const comment = await publishCommentary(eventId, user.id, input);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    const result = serializeServiceError(error);
    return NextResponse.json({ error: result.message, issues: "issues" in result ? result.issues : undefined }, { status: result.status });
  }
}
