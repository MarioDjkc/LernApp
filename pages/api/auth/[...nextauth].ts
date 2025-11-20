// pages/api/auth/[...nextauth].ts
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "text" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] credentials:", credentials);

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("[AUTH] user found?", !!user);
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        console.log("[AUTH] bcrypt ok?", ok);
        if (!ok) return null;

        // User, der in Token/Session landet (nur Schüler!)
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // beim Login User-ID in den Token schreiben
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },

    async session({ session, token }) {
      // ID aus dem Token in die Session übernehmen
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },

    // ⭐ Nach erfolgreichem Login IMMER auf das Schüler-Dashboard schicken
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/student/dashboard`;
    },
  },

  pages: {
    signIn: "/",          // deine Login-Seite für Schüler
    error: "/auth/error", // Fehlerseite (falls du eine hast)
  },
};

export default function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions);
}
