import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email fehlt" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) return NextResponse.json({ slots: [] });

    const slots = await prisma.availability.findMany({
      where: { teacherId: teacher.id },
      orderBy: [{ date: "asc" }, { start: "asc" }],
    });

    return NextResponse.json({ slots });
  } catch (e) {
    console.error("GET /api/teacher/availability error:", e);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, date, start, end } = await req.json();

    if (!email || !date || !start || !end) {
      return NextResponse.json({ error: "Daten fehlen" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) {
      return NextResponse.json({ error: "Lehrer nicht gefunden" }, { status: 404 });
    }

    const created = await prisma.availability.create({
      data: {
        teacherId: teacher.id,
        date: new Date(date),
        start,
        end,
      },
    });

    return NextResponse.json({ ok: true, created });
  } catch (e) {
    console.error("POST /api/teacher/availability error:", e);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
