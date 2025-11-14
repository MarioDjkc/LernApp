import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const runtime = "nodejs";

// Hilfsfunktion: Cookie serialisieren
function serializeCookie(
  name: string,
  value: string,
  opts: {
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    maxAge?: number;
  } = {}
) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  parts.push(`Path=${opts.path ?? "/"}`);
  if (typeof opts.maxAge === "number") parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join("; ");
}

// Hilfsfunktion: Mailer konfigurieren
async function sendMail(to: string, link: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Passwort für dein Lehrer-Konto setzen",
    html: `
      <p>Hallo!</p>
      <p>Bitte klicke auf den folgenden Link, um dein Passwort festzulegen:</p>
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/teacher/set-password?token=${link}">${process.env.NEXT_PUBLIC_BASE_URL}/teacher/set-password?token=${link}</a></p>
      <p>Dieser Link ist 1 Stunde gültig.</p>
    `,
  });
}

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich." },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        password: true,
        mustChangePassword: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Falsche Zugangsdaten." }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, teacher.password);
    if (!ok) {
      return NextResponse.json({ error: "Falsche Zugangsdaten." }, { status: 401 });
    }

    // Prüfen ob neues Passwort gesetzt werden muss
    if (teacher.mustChangePassword) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1h

      await prisma.passwordResetToken.create({
        data: {
          token,
          teacherId: teacher.id,
          expiresAt: expires,
        },
      });

      await sendMail(teacher.email, token);

      return NextResponse.json({
        ok: true,
        message: "Bitte prüfe deine E-Mail, um ein neues Passwort zu setzen.",
      });
    }

    // Cookie 7 Tage
    const setCookie = serializeCookie("teacher_session", teacher.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return new NextResponse(
      JSON.stringify({
        ok: true,
        data: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          subject: teacher.subject,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Set-Cookie": setCookie },
      }
    );
  } catch (err) {
    console.error("POST /api/teacher/login error:", err);
    return NextResponse.json({ error: "ServerFehler" }, { status: 500 });
  }
}
