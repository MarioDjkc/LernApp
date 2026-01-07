// app/api/student/availability/route.ts
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

    const teacherId = searchParams.get("teacherId");
    const subject = searchParams.get("subject"); // z.B. "Mathematik" (optional)

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId fehlt" }, { status: 400 });
    }

    // Lehrer holen + Fächer mitschicken
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, subject: true, name: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Lehrer nicht gefunden" }, { status: 404 });
    }

    const subjects = parseSubjects(teacher.subject);

    // Slots laden:
    // - Wenn subject gewählt: zeige Slots mit subject === gewähltes Fach ODER subject === "ALL"
    // - Wenn kein subject gewählt: zeige ALLE Slots (inkl ALL und einzelne Fächer)
    const whereClause: any = { teacherId };

    if (subject && subject !== "ALL") {
      whereClause.OR = [{ subject: subject }, { subject: "ALL" }];
    }

    const slots = await prisma.availability.findMany({
      where: whereClause,
      orderBy: [{ date: "asc" }, { start: "asc" }],
    });

    return NextResponse.json({ ok: true, subjects, slots });
  } catch (err) {
    console.error("GET /api/student/availability error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
