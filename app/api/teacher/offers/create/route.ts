// app/api/teacher/offers/create/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = (body?.email as string | undefined)?.trim().toLowerCase();
    const subjectId = body?.subjectId as string | undefined;

    const schoolTrack = body?.schoolTrack as "AHS" | "BHS" | "OTHER" | undefined;
    const schoolForm = body?.schoolForm as string | undefined;
    const level = body?.level as "UNTERSTUFE" | "OBERSTUFE" | undefined;

    const minGrade = Number(body?.minGrade);
    const maxGrade = Number(body?.maxGrade);

    if (!email || !subjectId || !schoolTrack || !schoolForm || !level) {
      return NextResponse.json(
        { error: "Fehlende Felder (email, subjectId, schoolTrack, schoolForm, level)" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(minGrade) || !Number.isFinite(maxGrade)) {
      return NextResponse.json({ error: "minGrade/maxGrade müssen Zahlen sein." }, { status: 400 });
    }

    if (minGrade < 1 || maxGrade < 1 || minGrade > maxGrade) {
      return NextResponse.json(
        { error: "Ungültiger Klassenbereich (minGrade/maxGrade)." },
        { status: 400 }
      );
    }

    // optional: harte Grenzen je Track
    const hardMax = schoolTrack === "AHS" ? 4 : schoolTrack === "BHS" ? 5 : 5;
    if (maxGrade > hardMax) {
      return NextResponse.json(
        { error: `Maximale Klasse für ${schoolTrack} ist ${hardMax}.` },
        { status: 400 }
      );
    }

    // Teacher finden
    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher nicht gefunden." }, { status: 404 });
    }

    // Subject existiert?
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });

    if (!subject) {
      return NextResponse.json({ error: "Fach (Subject) nicht gefunden." }, { status: 404 });
    }

    // Offer erstellen (oder upsert gegen Duplikate)
    const created = await prisma.teachingOffer.create({
      data: {
        teacherId: teacher.id,
        subjectId: subject.id,
        schoolTrack,
        schoolForm: schoolForm as any,
        level,
        minGrade,
        maxGrade,
      },
      include: {
        subject: true,
      },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    console.error("POST /api/teacher/offers/create error:", err);

    // Unique constraint (wenn du @@unique gesetzt hast)
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Dieses Angebot existiert bereits." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
