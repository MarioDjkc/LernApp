// app/api/bookings/teacher/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email fehlt" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher nicht gefunden" }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: { teacherId: teacher.id },
      orderBy: { start: "asc" },
      include: {
        student: { select: { name: true, email: true } },
      },
    });

    // Dates sauber als ISO Strings zurückgeben
    const normalized = bookings.map((b) => ({
      id: b.id,
      start: b.start.toISOString(),
      end: b.end.toISOString(),
      status: b.status as "pending" | "accepted" | "declined",
      note: (b as any).note ?? null, // ✅ NEU
      student: b.student,
    }));

    return NextResponse.json({ ok: true, bookings: normalized });
  } catch (err) {
    console.error("GET /api/bookings/teacher error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
