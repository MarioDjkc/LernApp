import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const teacherId = session.user.id;

    const bookings = await prisma.booking.findMany({
      where: { teacherId },
      include: {
        student: true,
      },
      orderBy: { start: "asc" },
    });

    const events = bookings.map((b) => ({
      id: b.id,
      title: `Schüler: ${b.student.name ?? b.student.email}`,
      start: b.start,
      end: b.end,
    }));

    return NextResponse.json({ events, bookings });
  } catch (err) {
    console.error("GET /api/bookings/teacher error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
