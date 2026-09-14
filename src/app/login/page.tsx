import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Control Room sign in",
  description: "Sign in to the Sports Live Ops demonstration Control Room.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
