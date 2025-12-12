// pages/api/auth/[...nextauth].ts
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // 1️⃣ ZUERST: Lehrer prüfen
        const teacher = await prisma.teacher.findUnique({
          where: { email: credentials.email },
        });

        if (teacher) {
          const ok = await bcrypt.compare(
            credentials.password,
            teacher.password
          );

          if (!ok) return null;

          return {
            id: teacher.id,
            email: teacher.email,
            name: teacher.name,
            role: "teacher",
          };
        }

        // 2️⃣ DANACH: Schüler prüfen
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: "student",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },

    async redirect({ baseUrl, token }) {
      if ((token as any)?.role === "teacher") {
        return `${baseUrl}/teacher/dashboard`;
      }
      return `${baseUrl}/student/dashboard`;
    },
  },

  pages: {
    signIn: "/", // eine Login-Seite für ALLE
  },
};

export default function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions);
}
