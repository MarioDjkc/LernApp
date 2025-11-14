import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
const prisma = new PrismaClient();

/**
 * POST /api/bookings
 * body: { teacherId, name, email, date: YYYY-MM-DD, time: HH:MM, note? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, name, email, date, time, note } = body || {};

    if (!teacherId || !name || !email || !date || !time) {
      return NextResponse.json({ error: "Felder fehlen" }, { status: 400 });
    }

    // Kombiniere Datum + Uhrzeit in lokale Zeit
    const datetime = new Date(`${date}T${time}:00`);

    // Doppelbuchung verhindern
    const exists = await prisma.booking.findFirst({
      where: { teacherId, datetime },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Slot bereits belegt" },
        { status: 409 }
      );
    }

    const created = await prisma.booking.create({
      data: {
        teacherId,
        name,
        email,
        datetime,
        note: note ?? "REQUESTED", // einfache Markierung als "angefragt"
      },
    });

    return NextResponse.json({ ok: true, booking: created }, { status: 201 });
  } catch (e) {
    console.error("BOOKING_CREATE_ERROR", e);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
