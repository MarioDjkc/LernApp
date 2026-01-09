// app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = (body?.name ?? "").trim();
    const email = (body?.email ?? "").trim().toLowerCase();
    const password = body?.password ?? "";

    // ✅ NEU:
    const schoolName = (body?.schoolName ?? "").trim();
    const schoolType = body?.schoolType ?? null; // "AHS" | "HTL" | ...
    const gradeRaw = body?.grade;
    const level = body?.level ?? null; // "UNTERSTUFE" | "OBERSTUFE"

    if (!email || !password) {
      return NextResponse.json({ error: "E-Mail und Passwort sind Pflicht." }, { status: 400 });
    }

    // optional aber sinnvoll:
    if (!schoolName) {
      return NextResponse.json({ error: "Schule ist Pflicht." }, { status: 400 });
    }
    if (!gradeRaw && gradeRaw !== 0) {
      return NextResponse.json({ error: "Klasse ist Pflicht." }, { status: 400 });
    }

    const grade = Number(gradeRaw);
    if (!Number.isFinite(grade) || grade < 1 || grade > 13) {
      return NextResponse.json({ error: "Klasse muss eine Zahl zwischen 1 und 13 sein." }, { status: 400 });
    }

    if (!level || (level !== "UNTERSTUFE" && level !== "OBERSTUFE")) {
      return NextResponse.json({ error: "Bitte Unterstufe/Oberstufe auswählen." }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "E-Mail ist bereits registriert." }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hash,
        role: "student",

        // ✅ NEU:
        schoolName,
        schoolType,
        grade,
        level,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ ok: true, user: created });
  } catch (err) {
    console.error("POST /api/register error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
