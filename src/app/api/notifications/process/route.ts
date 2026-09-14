import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser } from "@/lib/server/require-user";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (user.role !== Role.ADMIN && user.role !== Role.OPERATOR) return NextResponse.json({ error: "You cannot process notifications." }, { status: 403 });
  try {
    const processed = await prisma.$transaction(async (tx) => {
      const result = await tx.notificationOutbox.updateMany({ where: { status: "PENDING" }, data: { status: "PROCESSED", processedAt: new Date() } });
      if (result.count > 0) await tx.auditLog.create({ data: { actorId: user.id, action: "NOTIFICATIONS_PROCESSED", entityType: "NotificationOutbox", entityId: "batch", metadata: { count: result.count } } });
      return result.count;
    });
    return NextResponse.json({ processed });
  } catch {
    return NextResponse.json({ error: "Pending notifications could not be processed." }, { status: 500 });
  }
}
