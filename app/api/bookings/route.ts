// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const studentId = session.user.id;
    const { teacherId, start, end, priceCents } = await req.json();

    if (!teacherId || !start) {
      return NextResponse.json(
        { error: "teacherId und start sind erforderlich" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        studentId,
        teacherId,
        start: new Date(start),
        end: end ? new Date(end) : new Date(new Date(start).getTime() + 60 * 60 * 1000), // default 1h
        priceCents: priceCents ?? 2500,
        currency: "eur",
        status: "pending",
      },
    });

    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
