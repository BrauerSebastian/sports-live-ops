import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { clearLoginAttempts, consumeLoginAttempt } from "@/lib/server/login-protection";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({
    name: "Demo credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      website: { label: "Website", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;

      // Honeypot: humans never fill this visually hidden field.
      if (credentials.website?.trim()) return null;

      const email = credentials.email.trim().toLowerCase();
      if (!consumeLoginAttempt(email)) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) return null;

      clearLoginAttempts(email);
      return { id: user.id, email: user.email, name: user.displayName, role: user.role };
    },
  })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? Role.OPERATOR;
      }
      return session;
    },
  },
};
