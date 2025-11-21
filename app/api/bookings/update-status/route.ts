// app/api/bookings/update-status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "bookingId oder status fehlt" },
        { status: 400 }
      );
    }

    if (!["accepted", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "Ungültiger Status" },
        { status: 400 }
      );
    }

    // Termin inkl. Student & Teacher laden + Status setzen
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        student: true, // dein User-Modell
        teacher: true,
      },
    });

    // Wenn angenommen → Chat anlegen (falls noch keiner existiert)
    if (status === "accepted") {
      if (!booking.student?.email) {
        console.warn("Booking hat keinen Student mit E-Mail, Chat wird nicht erstellt.");
      } else {
        const existingChat = await prisma.chat.findFirst({
          where: {
            teacherId: booking.teacherId,
            studentEmail: booking.student.email,
          },
        });

        if (!existingChat) {
          await prisma.chat.create({
            data: {
              teacherId: booking.teacherId,
              studentEmail: booking.student.email,
              bookingId: booking.id,
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("update-status Fehler:", err);
    return NextResponse.json(
      { error: "Serverfehler beim Aktualisieren" },
      { status: 500 }
    );
  }
}
