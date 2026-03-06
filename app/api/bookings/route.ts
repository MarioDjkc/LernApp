// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { logError } from "@/app/lib/logError";

export const runtime = "nodejs";

function isValidISODateTime(value: string) {
  return typeof value === "string" && value.includes("T");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const teacherId = body?.teacherId as string | undefined;
    const studentEmailRaw = body?.studentEmail as string | undefined;
    const studentEmail = studentEmailRaw?.trim().toLowerCase();
    const studentName = body?.studentName as string | undefined;
    const start = body?.start as string | undefined;
    const end = body?.end as string | undefined;

    const noteRaw = body?.note as string | undefined;
    const note = noteRaw?.trim() ? noteRaw.trim() : null;

    // ✅ vom Frontend kommt availabilityId bereits
    const availabilityId = body?.availabilityId as string | undefined;

    if (!teacherId || !studentEmail || !start || !end) {
      return NextResponse.json(
        { error: "teacherId, studentEmail, start oder end fehlt" },
        { status: 400 }
      );
    }

    if (!isValidISODateTime(start) || !isValidISODateTime(end)) {
      return NextResponse.json(
        { error: "start/end müssen ISO DateTime sein (z.B. 2026-02-02T12:22:00)" },
        { status: 400 }
      );
    }

    // 1) Teacher muss existieren
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher nicht gefunden" }, { status: 404 });
    }

    // 2) Slot validieren (wenn gesetzt)
    if (availabilityId) {
      const slot = await prisma.availability.findUnique({
        where: { id: availabilityId },
        select: { id: true, teacherId: true },
      });

      if (!slot || slot.teacherId !== teacher.id) {
        return NextResponse.json(
          { error: "Zeitfenster nicht gefunden oder gehört nicht zu diesem Lehrer" },
          { status: 404 }
        );
      }
    }

    // 3) Student finden oder anlegen
    const student = await prisma.user.upsert({
      where: { email: studentEmail },
      update: { name: studentName ?? undefined },
      create: {
        email: studentEmail,
        password: "TEMP_PASSWORD_CHANGE_ME",
        name: studentName ?? null,
        role: "student",
      },
      select: { id: true, email: true },
    });

    // 4) Booking erstellen (✅ Slot NICHT löschen)
    const booking = await prisma.booking.create({
      data: {
        teacherId: teacher.id,
        studentId: student.id,
        start: new Date(start),
        end: new Date(end),
        priceCents: 0,
        currency: "eur",
        status: "pending",
        note,

        // ✅ NEU: Verknüpfung speichern
        availabilityId: availabilityId || null,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, booking });
  } catch (err: any) {
    logError("app/api/bookings POST", err).catch(() => {});
    console.error("POST /api/bookings error:", err);

    if (err?.code === "P2003") {
      return NextResponse.json(
        { error: "Foreign Key Fehler: teacherId oder studentId existiert nicht." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
