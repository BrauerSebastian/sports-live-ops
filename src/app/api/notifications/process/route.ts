import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser } from "@/lib/server/require-user";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (user.role !== Role.ADMIN && user.role !== Role.OPERATOR) return NextResponse.json({ error: "You cannot process notifications." }, { status: 403 });
  const result = await prisma.notificationOutbox.updateMany({ where: { status: "PENDING" }, data: { status: "PROCESSED", processedAt: new Date() } });
  return NextResponse.json({ processed: result.count });
}
