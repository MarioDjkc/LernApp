import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    // 🔹 1) Daten aus dem Request auslesen
    const {
      teacherId,
      studentName,
      studentEmail,
      subject,
      startDate,
      endDate,
      note,
    } = await req.json();

    // 🔹 2) Validierung
    if (!teacherId || !studentName || !studentEmail || !startDate) {
      return NextResponse.json(
        { error: "Fehlende Felder (teacherId, studentName, studentEmail, startDate)." },
        { status: 400 }
      );
    }

    // 🔹 3) Termin in der Datenbank speichern
    const booking = await prisma.booking.create({
      data: {
        teacherId,
        studentName,
        studentEmail,
        subject: subject ?? null,
        startsAt: new Date(startDate),
        endsAt: endDate ? new Date(endDate) : null,
        note: note ?? null,
        status: "REQUESTED", // Status für angefragt
      },
    });

    // 🔹 4) Erfolg zurückgeben
    return NextResponse.json(
      { ok: true, booking },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
