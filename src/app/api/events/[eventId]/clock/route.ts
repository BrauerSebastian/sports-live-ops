import { NextResponse } from "next/server";
import { canOperate, clockInput, serializeServiceError, updateEventClock } from "@/lib/server/event-service";
import { getCurrentUser } from "@/lib/server/require-user";

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!canOperate(user.role)) return NextResponse.json({ error: "You cannot update the match clock." }, { status: 403 });
  try {
    const input = clockInput.parse(await request.json());
    const { eventId } = await params;
    const event = await updateEventClock(eventId, user.id, input);
    return NextResponse.json({ event });
  } catch (error) {
    const result = serializeServiceError(error);
    return NextResponse.json({ error: result.message, issues: "issues" in result ? result.issues : undefined }, { status: result.status });
  }
}
