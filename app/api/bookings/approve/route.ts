// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      teacherId,
      studentName,
      studentEmail,
      subject,
      startDate,
      endDate,
      note,
    } = body as {
      teacherId?: string;
      studentName?: string;
      studentEmail?: string;
      subject?: string;
      startDate?: string; // ISO-String z.B. "2025-11-20T14:00:00.000Z"
      endDate?: string;
      note?: string;
    };

    // 🔹 Pflichtfelder prüfen
    if (!teacherId || !studentName || !studentEmail || !startDate) {
      return NextResponse.json(
        {
          error:
            "teacherId, studentName, studentEmail und startDate sind Pflicht.",
        },
        { status: 400 }
      );
    }

    // 🔹 Lehrer existiert?
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Lehrer wurde nicht gefunden." },
        { status: 404 }
      );
    }

    // 🔹 Datum parsen
    const startsAt = new Date(startDate);
    const endsAt = endDate ? new Date(endDate) : null;

    if (isNaN(startsAt.getTime()) || (endDate && isNaN(endsAt!.getTime()))) {
      return NextResponse.json(
        { error: "Ungültiges Datum / Uhrzeit." },
        { status: 400 }
      );
    }

    // 🔹 Termin speichern (Status: REQUESTED)
    const booking = await prisma.booking.create({
      data: {
        teacherId,
        studentName,
        studentEmail,
        subject: subject ?? null,
        startsAt,
        endsAt,
        note: note ?? null,
        status: "REQUESTED", // angefragt
      },
    });

    return NextResponse.json(
      {
        ok: true,
        booking,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "ServerFehler bei der Buchung." },
      { status: 500 }
    );
  }
}
