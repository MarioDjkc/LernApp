// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

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
    } = body;

    if (!teacherId || !studentName || !studentEmail || !startDate) {
      return NextResponse.json(
        { error: "Ungültige oder fehlende Daten" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (isNaN(start.getTime()) || (endDate && isNaN(end!.getTime()))) {
      return NextResponse.json(
        { error: "Ungültige Datumsangaben" },
        { status: 400 }
      );
    }

    // 🔹 Student erstellen oder verbinden (User-Tabelle)
    const student = await prisma.user.upsert({
      where: { email: studentEmail },
      update: {},
      create: {
        name: studentName,
        email: studentEmail,
        password: "temp123", // nur Platzhalter
      },
    });

    // 🔹 Booking erstellen (Booking hat studentId + teacherId im Schema)
    const booking = await prisma.booking.create({
      data: {
        start,
        end,
        priceCents: 4000,
        currency: "eur",
        status: "pending",
        teacher: {
          connect: { id: teacherId },
        },
        student: {
          connect: { id: student.id },
        },
      },
    });

    // 🔹 Chat erstellen oder finden
    // Chat-Modell hat KEIN studentId, sondern studentEmail!
    let chat = await prisma.chat.findFirst({
      where: {
        teacherId: teacherId,
        studentEmail: studentEmail,
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          teacherId: teacherId,
          studentEmail: studentEmail,
          bookingId: booking.id,
        },
      });
    }

    // 🔹 Systemnachricht in den Chat
    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        sender: "system",
        text: `Neue Terminanfrage für den ${start.toLocaleString("de-DE")}`,
      },
    });

    return NextResponse.json({ booking, chat }, { status: 200 });
  } catch (err) {
    console.error("[BOOKING_ERROR]", err);
    return NextResponse.json(
      { error: "Serverfehler bei der Terminbuchung" },
      { status: 500 }
    );
  }
}
