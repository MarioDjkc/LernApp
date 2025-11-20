// app/api/apply/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const email = formData.get("email") as string | null;
    const subject = formData.get("subject") as string | null;
    const letter = formData.get("letter") as string | null;
    const file = formData.get("file") as File | null;

    // 🔹 Validierung
    if (!name || !email || !letter || !file) {
      return NextResponse.json(
        { error: "Name, E-Mail, Bewerbungstext und PDF sind erforderlich." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Bitte ein PDF hochladen." },
        { status: 400 }
      );
    }

    // 🔹 PDF auf dem Server speichern
    const uploadsDir = path.join(
      process.cwd(),
      "uploads",
      "teacher-applications"
    );
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    // Pfad, den wir in der DB speichern (relativ)
    const dbFilePath = `uploads/teacher-applications/${fileName}`;

    // 🔹 Bewerbung in der DB speichern (TeacherApplication)
    const created = await prisma.teacherApplication.create({
      data: {
        name,
        email,
        subject: subject || null,
        letter,
        filePath: dbFilePath,
      },
    });

    // 🔹 E-Mail verschicken (an Admin)
    const ADMIN_EMAIL =
      process.env.ADMIN_NOTIFY_EMAIL || process.env.FROM_EMAIL;

    if (!ADMIN_EMAIL) {
      console.warn(
        "[apply] Keine ADMIN_NOTIFY_EMAIL / FROM_EMAIL gesetzt – es wird keine Mail verschickt."
      );
    } else {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465, // 465 = SSL
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: ADMIN_EMAIL,
        replyTo: email,
        subject: "Neue Lehrer-Bewerbung",
        html: `
          <h2>Neue Lehrer-Bewerbung</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>E-Mail:</strong> ${email}</p>
          <p><strong>Fach:</strong> ${subject || "-"}</p>
          <p><strong>Bewerbungstext:</strong></p>
          <pre>${letter}</pre>
          <p>Die Bewerbung wurde in der Datenbank gespeichert.</p>
          <p>PDF-Pfad: <code>${dbFilePath}</code></p>
          <p>Prisma Studio: ${baseUrl.replace(/\/$/, "")}/ (z.B. mit <code>npx prisma studio</code>)</p>
        `,
      });
    }

    return NextResponse.json({ ok: true, created });
  } catch (err) {
    console.error("POST /api/apply error:", err);
    return NextResponse.json(
      { error: "Serverfehler beim Senden der Bewerbung." },
      { status: 500 }
    );
  }
}
