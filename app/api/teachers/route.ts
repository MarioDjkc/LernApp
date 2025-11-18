// app/api/teachers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const runtime = "nodejs";

//
// 🔹 GET  /api/teachers
// Wird von deinem Dashboard mit fetch("/api/teachers") aufgerufen
//
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
      },
      orderBy: { name: "asc" },
    });

    // wichtig: immer gültiges JSON zurückgeben
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
// 🔹 POST  /api/teachers
// Admin legt neuen Lehrer an (mit E-Mail + Reset-Link)
//
export async function POST(req: Request) {
  try {
    const { id, name, email, subject } = (await req.json()) as {
      id?: string;
      name?: string;
      email?: string;
      subject?: string;
    };

    if (!id || !name || !email || !subject) {
      return NextResponse.json(
        { error: "Bitte id, name, email und subject angeben." },
        { status: 400 }
      );
    }

    // Temporäres Passwort erstellen und hashen
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Lehrer anlegen
    const created = await prisma.teacher.create({
      data: {
        id,
        name,
        email,
        subject,
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    // Reset-Token (24h gültig)
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        teacherId: created.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Mail-Transport
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

    // E-Mail an Lehrer senden
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

    return NextResponse.json({ ok: true, created });
  } catch (err) {
    console.error("POST /api/teachers error:", err);
    return NextResponse.json({ error: "ServerFehler" }, { status: 500 });
  }
}
