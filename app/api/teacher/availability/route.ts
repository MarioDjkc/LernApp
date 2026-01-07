// app/api/teacher/availability/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

function parseSubjects(subjectRaw: string | null | undefined): string[] {
  if (!subjectRaw) return [];
  return subjectRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email fehlt" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: {
        id: true,
        subject: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Lehrer nicht gefunden" }, { status: 404 });
    }

    const slots = await prisma.availability.findMany({
      where: { teacherId: teacher.id },
      orderBy: [{ date: "asc" }, { start: "asc" }],
    });

    return NextResponse.json({
      ok: true,
      slots,
      subjects: parseSubjects(teacher.subject), // ✅ Lehrer-Fächer für Dropdown
    });
  } catch (err) {
    console.error("GET /api/teacher/availability error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email as string | undefined;
    const date = body?.date as string | undefined;
    const start = body?.start as string | undefined;
    const end = body?.end as string | undefined;

    // subject kann "ALL" oder "Englisch" etc sein
    const subject = (body?.subject as string | undefined) ?? "ALL";

    if (!email || !date || !start || !end) {
      return NextResponse.json({ error: "email/date/start/end fehlt" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: { id: true, subject: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Lehrer nicht gefunden" }, { status: 404 });
    }

    const teacherSubjects = parseSubjects(teacher.subject);

    // ✅ nur erlaubte Fächer speichern (oder ALL)
    if (subject !== "ALL" && !teacherSubjects.includes(subject)) {
      return NextResponse.json(
        { error: "Ungültiges Fach für diesen Lehrer" },
        { status: 400 }
      );
    }

    const created = await prisma.availability.create({
      data: {
        teacherId: teacher.id,
        date: new Date(date),
        start,
        end,
        subject, // ✅ muss in deinem Schema existieren
      },
    });

    return NextResponse.json({ ok: true, slot: created });
  } catch (err) {
    console.error("POST /api/teacher/availability error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
