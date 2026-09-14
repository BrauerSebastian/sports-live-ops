import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { PublicFooter } from "@/components/legal/PublicFooter";
import { getCurrentUser } from "@/lib/server/require-user";

export default async function LiveLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <AppShell user={user ? { name: user.name ?? user.email ?? "User", role: user.role } : null}>
      <div className="live-shell-content">{children}</div>
      <PublicFooter />
    </AppShell>
  );
}
