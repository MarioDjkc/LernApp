import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-Mail und Passwort sind erforderlich" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "E-Mail existiert bereits" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json({ message: "Benutzer erstellt", user }, { status: 201 });
  } catch (err) {
    console.error("REGISTER_ERROR", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
