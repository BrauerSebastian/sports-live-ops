import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "ok", service: "sports-live-ops" });
  } catch {
    return NextResponse.json({ status: "degraded", database: "unavailable", service: "sports-live-ops" }, { status: 503 });
  }
}
