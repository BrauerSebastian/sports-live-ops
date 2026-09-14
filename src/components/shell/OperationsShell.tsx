import type { ReactNode } from "react";
import { AppShell, type ShellUser } from "@/components/shell/AppShell";

export function OperationsShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  return <AppShell user={user}>{children}</AppShell>;
}
