import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { getUserByEmail } from "@/lib/auth/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? "arco-dev-secret-change-in-production",
  providers: [
    Credentials({
      id: "email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        if (typeof email !== "string") return null;

        const user = await getUserByEmail(email);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});
