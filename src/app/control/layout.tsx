import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/require-user";
import { OperationsShell } from "@/components/shell/OperationsShell";

export default async function ControlLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <OperationsShell user={{ name: user.name ?? user.email ?? "Demo user", role: user.role }}>{children}</OperationsShell>;
}
