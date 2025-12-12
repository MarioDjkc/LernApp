// app/api/bookings/student/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

function combineDateAndTime(dateObj: Date, time: string) {
  const yyyyMmDd = dateObj.toISOString().split("T")[0];
  return new Date(`${yyyyMmDd}T${time}:00`);
}

export async function POST(req: Request) {
  try {
    const { availabilityId, studentEmail, studentName } = await req.json();

    if (!availabilityId || !studentEmail || !studentName) {
      return NextResponse.json(
        { error: "Daten unvollständig" },
        { status: 400 }
      );
    }

    // 1) Student über E-Mail holen (oder neu anlegen)
    let student = await prisma.user.findUnique({
      where: { email: studentEmail },
    });

    if (!student) {
      student = await prisma.user.create({
        data: {
          email: studentEmail,
          name: studentName,
          password: "temp", // später sauber lösen
          role: "student",
        },
      });
    }

    // 2) Slot holen
    const slot = await prisma.availability.findUnique({
      where: { id: availabilityId },
    });

    if (!slot) {
      return NextResponse.json(
        { error: "Slot existiert nicht mehr" },
        { status: 404 }
      );
    }

    const start = combineDateAndTime(slot.date, slot.start);
    const end = combineDateAndTime(slot.date, slot.end);

    // 3) TRANSAKTION: Booking erstellen + Slot löschen
    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          studentId: student.id,
          teacherId: slot.teacherId,
          start,
          end,
          priceCents: 0,
          currency: "eur",
          status: "pending",
        },
      });

      await tx.availability.delete({
        where: { id: availabilityId },
      });

      return createdBooking;
    });

    return NextResponse.json({ ok: true, booking });
  } catch (e) {
    console.error("POST /api/bookings/student error:", e);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
