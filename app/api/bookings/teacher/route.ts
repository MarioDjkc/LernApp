// app/api/bookings/teacher/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    // Lehrer-ID aus Query lesen: ?teacherId=abc
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "teacherId fehlt" },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { teacherId },
      orderBy: { start: "asc" },
      include: {
        student: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (e) {
    console.error("[API/teacher/bookings] ERROR:", e);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
