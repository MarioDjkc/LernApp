import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Nicht eingeloggt" },
        { status: 401 }
      );
    }

    // Buchungen des Schülers laden
    const bookings = await prisma.booking.findMany({
      where: {
        student: {
          email: session.user.email,
        },
      },
      include: {
        teacher: true,
      },
      orderBy: { start: "asc" },
    });

    return NextResponse.json({ data: bookings });
  } catch (error) {
    console.error("GET /api/bookings/student error:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
