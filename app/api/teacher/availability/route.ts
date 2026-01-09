import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

// GET /api/teacher/availability?email=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ data: [], error: "email fehlt" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ data: [], error: "Teacher nicht gefunden" }, { status: 404 });
    }

    const slots = await prisma.availability.findMany({
      where: { teacherId: teacher.id },
      orderBy: { date: "asc" },
      include: {
        offer: {
          include: { subject: true },
        },
      },
    });

    return NextResponse.json({ data: slots });
  } catch (err) {
    console.error("GET /api/teacher/availability error:", err);
    return NextResponse.json({ data: [], error: "Serverfehler" }, { status: 500 });
  }
}

// POST /api/teacher/availability
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email || "").trim().toLowerCase();
    const date = body?.date as string | undefined; // yyyy-mm-dd
    const start = body?.start as string | undefined; // HH:mm
    const end = body?.end as string | undefined; // HH:mm
    const offerId = (body?.offerId as string | undefined) || null;

    if (!email || !date || !start || !end) {
      return NextResponse.json(
        { error: "email, date, start, end fehlt" },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher nicht gefunden" }, { status: 404 });
    }

    // date ist nur Datum, start/end sind Strings -> speichern wir getrennt
    const created = await prisma.availability.create({
      data: {
        teacherId: teacher.id,
        date: new Date(date), // nur Datum
        start,
        end,
        offerId: offerId || null,
      },
      include: {
        offer: { include: { subject: true } },
      },
    });

    return NextResponse.json({ ok: true, created });
  } catch (err) {
    console.error("POST /api/teacher/availability error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
