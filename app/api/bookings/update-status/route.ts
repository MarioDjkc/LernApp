import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { sendBookingAcceptedEmail } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bookingId = body?.bookingId as string | undefined;
    const status = body?.status as "accepted" | "declined" | undefined;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "bookingId oder status fehlt" },
        { status: 400 }
      );
    }

    // Booking inkl. Teacher + Student laden
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        teacher: true,
        student: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking nicht gefunden" },
        { status: 404 }
      );
    }

    // Status updaten
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // ✅ WENN "accepted": Chat erstellen + Bestätigungs-Mail schicken
    if (status === "accepted") {
      const studentEmail = booking.student?.email;
      const teacherId = booking.teacherId;

      // 1) Chat erstellen (falls noch keiner existiert)
      if (studentEmail && teacherId) {
        const existingChat = await prisma.chat.findFirst({
          where: {
            teacherId,
            studentEmail,
            bookingId: booking.id,
          },
        });

        if (!existingChat) {
          const createdChat = await prisma.chat.create({
            data: {
              teacherId,
              studentEmail,
              bookingId: booking.id,
            },
          });

          await prisma.chatMessage.create({
            data: {
              chatId: createdChat.id,
              sender: "system",
              text: `✅ Termin wurde angenommen. Ihr könnt hier im Chat schreiben.`,
            },
          });
        }
      }

      // 2) ✅ Bestätigungs-Mail senden (wichtig!)
      if (studentEmail) {
        try {
          await sendBookingAcceptedEmail({
            to: studentEmail,
            teacherName: booking.teacher?.name ?? "Lehrer",
            startISO: booking.start.toISOString(),
            endISO: booking.end.toISOString(),
          });
        } catch (mailErr) {
          // Mail-Fehler sollen NICHT den Status kaputt machen
          console.error("MAIL ERROR (accepted):", mailErr);
        }
      } else {
        console.warn("Kein studentEmail gefunden → keine Mail gesendet");
      }
    }

    return NextResponse.json({ ok: true, booking: updated });
  } catch (err) {
    console.error("POST /api/bookings/update-status error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
