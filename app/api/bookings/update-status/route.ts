// app/api/bookings/update-status/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const bookingId = body?.bookingId as string | undefined;
    const status = body?.status as "accepted" | "declined" | undefined;

    if (!bookingId || (status !== "accepted" && status !== "declined")) {
      return NextResponse.json(
        { error: "bookingId oder status (accepted/declined) fehlt" },
        { status: 400 }
      );
    }

    // Booking holen inkl. Student + TeacherId + availabilityId
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        teacherId: true,
        availabilityId: true,
        student: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking nicht gefunden" }, { status: 404 });
    }

    const studentEmail = booking.student?.email?.trim().toLowerCase();
    if (!studentEmail) {
      return NextResponse.json({ error: "Student email fehlt am Booking" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1) Status updaten
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status },
        select: { id: true, status: true },
      });

      // 2) ✅ nur bei accepted: Slot löschen
      if (status === "accepted" && booking.availabilityId) {
        // wenn Slot schon gelöscht wurde -> ignore Fehler
        await tx.availability
          .delete({ where: { id: booking.availabilityId } })
          .catch(() => null);
      }

      // 3) ✅ nur bei accepted: Chat erstellen (falls nicht existiert)
      let chatId: string | null = null;
      if (status === "accepted") {
        // existiert bereits ein Chat für diese Buchung?
        const existing = await tx.chat.findFirst({
          where: { bookingId: booking.id },
          select: { id: true },
        });

        if (existing) {
          chatId = existing.id;
        } else {
          const createdChat = await tx.chat.create({
            data: {
              teacherId: booking.teacherId,
              studentEmail,
              bookingId: booking.id,
            },
            select: { id: true },
          });

          chatId = createdChat.id;
        }
      }

      return { updated, chatId };
    });

    return NextResponse.json({ ok: true, data: result.updated, chatId: result.chatId });
  } catch (err) {
    console.error("POST /api/bookings/update-status error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
