// app/api/bookings/approve/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";


type Body = {
  bookingId?: string;
  action?: "accept" | "decline";
};

/**
 * Diese Route setzt den Status einer Buchung auf ACCEPTED oder DECLINED.
 * ➜ ACCEPTED = Termin erscheint im Kalender (wir werten im UI alle ACCEPTED-Bookings aus)
 * ➜ DECLINED = Termin wird abgelehnt
 *
 * Request:  POST /api/bookings/approve
 * Body:     { bookingId: string, action: "accept" | "decline" }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.bookingId || !body?.action) {
      return NextResponse.json(
        { error: "bookingId und action sind Pflichtfelder." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: { teacher: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Buchung nicht gefunden." },
        { status: 404 }
      );
    }

    const newStatus = body.action === "accept" ? "ACCEPTED" : "DECLINED" as const;

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: newStatus },
    });

    // WICHTIG: Wir benutzen das Booking selbst als „Kalendereintrag“.
    // Im Lehrer-Dashboard werden einfach alle Bookings mit status=ACCEPTED angezeigt.
    // => Kein extra Calendar-Model nötig.

    return NextResponse.json({
      ok: true,
      data: {
        id: updated.id,
        teacherId: updated.teacherId,
        datetime: updated.datetime,
        status: updated.status, // ACCEPTED | DECLINED
      },
      message:
        newStatus === "ACCEPTED"
          ? "Termin wurde angenommen und erscheint im Kalender."
          : "Termin wurde abgelehnt.",
    });
  } catch (err) {
    console.error("POST /api/bookings/approve error:", err);
    return NextResponse.json(
      { error: "Serverfehler beim Aktualisieren der Buchung." },
      { status: 500 }
    );
  }
}
