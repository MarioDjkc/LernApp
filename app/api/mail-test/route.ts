// app/api/mail-test/route.ts
import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

    // 1) ENV prüfen
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
      return NextResponse.json(
        { ok: false, error: "SMTP ENV unvollständig (HOST/PORT/USER/PASS/FROM_EMAIL)" },
        { status: 500 }
      );
    }

    // 2) nodemailer nur laden, wenn gebraucht
    const nodemailer = (await import("nodemailer")).default;

    // 3) Transporter bauen
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // 465=SSL, 587=STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    // 4) Testmail senden
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: "hamudi.mario.wiese@gmail.com", // deine Zieladresse
      subject: "LernApp SMTP Test",
      text: "Hallo! Diese Mail bestätigt, dass SMTP aus deiner App funktioniert.",
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}
