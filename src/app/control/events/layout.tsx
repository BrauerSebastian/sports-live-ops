import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/server/require-user";

export default async function EventOperationsLayout({ children }: Readonly<{ children: React.ReactNode }>) { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.role !== Role.ADMIN && user.role !== Role.OPERATOR) redirect("/forbidden"); return children; }
