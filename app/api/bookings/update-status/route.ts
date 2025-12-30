import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { sendBookingAcceptedEmail } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const bookingId = body?.bookingId as string | undefined;
    const status = body?.status as "accepted" | "declined" | "pending" | undefined;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "bookingId oder status fehlt" },
        { status: 400 }
      );
    }

    // Booking holen (inkl. Schüler/Lehrer)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { email: true, name: true } },
        teacher: { select: { name: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 });
    }

    // Status updaten
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // ✅ Wenn angenommen -> Mail an Schüler
    if (status === "accepted") {
      const to = booking.student?.email;
      if (to) {
        // Mail senden (Fehler beim Mailen soll NICHT den Status-Update kaputt machen)
        try {
          await sendBookingAcceptedEmail({
            to,
            teacherName: booking.teacher?.name ?? undefined,
            startISO: booking.start.toISOString(),
            endISO: booking.end.toISOString(),
          });
        } catch (mailErr) {
          console.error("MAIL ERROR (booking accepted):", mailErr);
        }
      }
    }

    return NextResponse.json({ ok: true, booking: updated });
  } catch (err) {
    console.error("POST /api/bookings/update-status error:", err);
    return NextResponse.json(
      { error: "Serverfehler beim Update" },
      { status: 500 }
    );
  }
}
