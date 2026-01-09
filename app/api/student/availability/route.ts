// app/api/student/availability/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const teacherId = (searchParams.get("teacherId") || "").trim();
    const subject = (searchParams.get("subject") || "").trim(); // z.B. "Mathematik" | "ALL" | ""

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId fehlt" }, { status: 400 });
    }

    // ✅ Lehrer + Offers laden (damit wir die "subjects" Liste bauen können)
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        offers: {
          select: {
            id: true,
            subject: { select: { name: true } },
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Lehrer nicht gefunden" },
        { status: 404 }
      );
    }

    // ✅ Fächerliste aus TeachingOffer (unique)
    const subjects = Array.from(
      new Set(
        teacher.offers
          .map((o) => o.subject?.name)
          .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, "de"));

    // ✅ Slots laden (NEUE Logik)
    // - subject=""    => ALLE Slots (ALL + fach-spezifisch)
    // - subject="ALL" => NUR ALL Slots (offerId = null)
    // - subject="BWL" => ALL Slots (offerId = null) ODER Offer mit subject=BWL
    const whereClause: any = { teacherId };

    if (subject) {
      if (subject === "ALL") {
        whereClause.offerId = null;
      } else {
        whereClause.OR = [
          { offerId: null }, // "ALL"
          {
            offer: {
              subject: {
                name: subject,
              },
            },
          },
        ];
      }
    }

    const slots = await prisma.availability.findMany({
      where: whereClause,
      include: {
        offer: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { start: "asc" }],
    });

    // Optional: schöner fürs Frontend
    const mappedSlots = slots.map((s) => ({
      id: s.id,
      teacherId: s.teacherId,
      date: s.date,
      start: s.start,
      end: s.end,
      offerId: s.offerId,
      subjectName: s.offer?.subject?.name ?? "ALL",
    }));

    return NextResponse.json({
      ok: true,
      teacher: { id: teacher.id, name: teacher.name },
      subjects,       // ✅ nur die Fächer die der Lehrer anbietet
      slots: mappedSlots,
    });
  } catch (err) {
    console.error("GET /api/student/availability error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
