// app/api/bookings/teacher/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "teacherId fehlt" },
        { status: 400 }
      );
    }

    // 🔹 Hier wird WIRKLICH die DB gelesen (deine Booking-Tabelle)
    const bookings = await prisma.booking.findMany({
      where: { teacherId },
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
