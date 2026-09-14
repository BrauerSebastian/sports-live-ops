import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/require-user";

export default async function ControlLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return children;
}
