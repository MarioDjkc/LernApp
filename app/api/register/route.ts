// app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    // 1) Felder prüfen
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich." },
        { status: 400 }
      );
    }

    // 2) Gibt es die E-Mail schon?
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Es existiert bereits ein Konto mit dieser E-Mail." },
        { status: 400 }
      );
    }

    // 3) Passwort hashen
    const hashed = await bcrypt.hash(password, 10);

    // 4) User anlegen
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
      },
    });

    // 5) Antwort
    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/register error:", err);
    return NextResponse.json(
      { error: "ServerFehler bei der Registrierung." },
      { status: 500 }
    );
  }
}
