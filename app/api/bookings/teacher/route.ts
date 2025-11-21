// app/api/bookings/teacher/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // wir arbeiten jetzt über die Lehrer-E-Mail
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "email fehlt" },
        { status: 400 }
      );
    }

    // Lehrer anhand der E-Mail finden
    const teacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Keinen Lehrer mit dieser E-Mail gefunden." },
        { status: 404 }
      );
    }

    // Jetzt wirklich die Booking-Tabelle lesen
    const bookings = await prisma.booking.findMany({
      where: { teacherId: teacher.id },
      include: {
        student: {
          select: { name: true, email: true },
        },
      },
      orderBy: { start: "asc" },
    });

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("GET /api/bookings/teacher error:", err);
    return NextResponse.json(
      { error: "Serverfehler beim Laden der Buchungen" },
      { status: 500 }
    );
  }
}
