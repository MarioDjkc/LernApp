// app/api/teachers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const runtime = "nodejs";

//
// 🔹 GET – alle Lehrer abrufen
//
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: { id: true, name: true, email: true, subject: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: teachers });
  } catch (err) {
    console.error("GET /api/teachers error:", err);
    return NextResponse.json(
      { data: [], error: "ServerFehler" },
      { status: 500 }
    );
  }
}

//
// 🔹 POST – Admin legt einen Lehrer an
//     NEU: KEINE id mehr nötig, wird automatisch erzeugt!
//
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
    const exists = await prisma.teacher.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Ein Lehrer mit dieser E-Mail existiert bereits." },
        { status: 400 }
      );
    }

    //
    // 🔹 Temp-Passwort generieren
    //
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    //
    // 🔹 Lehrer anlegen (ID automatisch per UUID)
    //
    const created = await prisma.teacher.create({
      data: {
        name,
        email,
        subject,
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    //
    // 🔹 Reset-Token erzeugen
    //
    const token = crypto.randomBytes(32).toString("hex");

    await prisma.passwordResetToken.create({
      data: {
        token,
        teacherId: created.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h gültig
      },
    });

    //
    // 🔹 E-Mail senden
    //
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

    //
    // 🔹 Response
    //
    return NextResponse.json({
      ok: true,
      created,
      tempPassword, // Kann angezeigt werden (z. B. im Admin)
    });
  } catch (err) {
    console.error("POST /api/teachers error:", err);
    return NextResponse.json(
      { error: "ServerFehler" },
      { status: 500 }
    );
  }
}
