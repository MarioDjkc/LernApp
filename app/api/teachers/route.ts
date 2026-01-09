// app/api/teachers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const runtime = "nodejs";

type StudentLevel = "UNTERSTUFE" | "OBERSTUFE";

/**
 * 🔹 GET – Lehrer abrufen (mit Level-Filter abhängig vom Schüler)
 *
 * Regel:
 * - Schüler OBERSTUFE => nur Lehrer, die MINDESTENS EIN Angebot (TeachingOffer) für OBERSTUFE haben
 * - Schüler UNTERSTUFE => Lehrer, die irgendein Angebot haben (UNTERSTUFE oder OBERSTUFE)
 * - Ohne studentEmail => alle Lehrer (optional: nur Lehrer mit offers – je nachdem wie du willst)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentEmail = (searchParams.get("studentEmail") || "")
      .trim()
      .toLowerCase();

    let studentLevel: StudentLevel | null = null;

    if (studentEmail) {
      const student = await prisma.user.findUnique({
        where: { email: studentEmail },
        select: { level: true },
      });

      studentLevel = (student?.level as StudentLevel | null) ?? null;
    }

    // ✅ Filter über offers.level (NICHT teacher.level)
    const where =
      studentLevel === "OBERSTUFE"
        ? {
            offers: {
              some: { level: "OBERSTUFE" },
            },
          }
        : studentLevel === "UNTERSTUFE"
        ? {
            offers: {
              some: {
                level: { in: ["UNTERSTUFE", "OBERSTUFE"] },
              },
            },
          }
        : {}; // kein Filter (alle Lehrer)

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,

        // ✅ subject bleibt (Übergang / Anzeige)
        subject: true,

        // ✅ wir holen Angebote, damit wir "Fächer" anzeigen können, die wirklich existieren
        offers: {
          select: {
            level: true,
            subject: { select: { name: true } },
          },
        },
      },
    });

    // ✅ Ausgabe so formen, dass dein Frontend weiter "subject: string" bekommt
    const mapped = teachers.map((t) => {
      const offerSubjects = (t.offers || [])
        .map((o) => o.subject?.name)
        .filter(Boolean) as string[];

      // Wenn Offers vorhanden -> Liste der echten Subjects anzeigen
      // sonst fallback auf teacher.subject
      const displaySubject =
        offerSubjects.length > 0 ? offerSubjects.join(", ") : t.subject;

      return {
        id: t.id,
        name: t.name,
        email: t.email,
        subject: displaySubject,
      };
    });

    return NextResponse.json({ data: mapped });
  } catch (err) {
    console.error("GET /api/teachers error:", err);
    return NextResponse.json(
      { data: [], error: "ServerFehler" },
      { status: 500 }
    );
  }
}

/**
 * 🔹 POST – Admin legt einen Lehrer an
 * Wichtig: Teacher hat KEIN level mehr.
 * Level wird später über TeachingOffers gesetzt (Meine Fächer).
 */
export async function POST(req: Request) {
  try {
    const { name, email, subject, adminKey } = await req.json();

    // Admin-Key validieren
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: "Ungültiger Admin-Key." },
        { status: 401 }
      );
    }

    // Pflichtfelder prüfen
    if (!name || !email || !subject) {
      return NextResponse.json(
        { error: "Bitte name, email und subject angeben." },
        { status: 400 }
      );
    }

    // Existiert schon?
    const exists = await prisma.teacher.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Ein Lehrer mit dieser E-Mail existiert bereits." },
        { status: 400 }
      );
    }

    // Temp-Passwort generieren
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Lehrer anlegen
    const created = await prisma.teacher.create({
      data: {
        name,
        email,
        subject, // ✅ bleibt subject
        password: hashedPassword,
        mustChangePassword: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        mustChangePassword: true,
      },
    });

    // Reset-Token erzeugen
    const token = crypto.randomBytes(32).toString("hex");

    await prisma.passwordResetToken.create({
      data: {
        token,
        teacherId: created.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    // E-Mail senden
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/teacher/set-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: created.email,
      subject: "Willkommen bei LernApp – Passwort festlegen",
      html: `
        <h2>Willkommen, ${created.name}!</h2>
        <p>Um deinen Lehrer-Account zu aktivieren, klicke bitte auf den folgenden Link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Dieser Link ist 24 Stunden gültig.</p>
      `,
    });

    return NextResponse.json({ ok: true, created, tempPassword });
  } catch (err) {
    console.error("POST /api/teachers error:", err);
    return NextResponse.json({ error: "ServerFehler" }, { status: 500 });
  }
}
