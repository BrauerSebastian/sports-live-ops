import { NextResponse } from "next/server";
import { canOperate, serializeServiceError, statusInput, transitionEvent } from "@/lib/server/event-service";
import { getCurrentUser } from "@/lib/server/require-user";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!canOperate(user.role)) return NextResponse.json({ error: "You cannot control events." }, { status: 403 });
  try {
    const input = statusInput.parse(await request.json());
    const { eventId } = await params;
    const event = await transitionEvent(eventId, input.status, user.id);
    return NextResponse.json({ event });
  } catch (error) {
    const result = serializeServiceError(error);
    return NextResponse.json({ error: result.message, issues: "issues" in result ? result.issues : undefined }, { status: result.status });
  }
}
