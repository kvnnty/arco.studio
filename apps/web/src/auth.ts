import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { apiLogin } from "@/lib/api/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? "arco-dev-secret-change-in-production",
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accessToken: { label: "Access Token", type: "text" },
        userId: { label: "User ID", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const accessToken = credentials?.accessToken;
        const userId = credentials?.userId;
        const email = credentials?.email;

        if (
          typeof accessToken === "string" &&
          typeof userId === "string" &&
          typeof email === "string"
        ) {
          return {
            id: userId,
            email,
            name:
              typeof credentials.name === "string" ? credentials.name : null,
            accessToken,
          };
        }

        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        try {
          const result = await apiLogin({ email, password });
          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            accessToken: result.access_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
