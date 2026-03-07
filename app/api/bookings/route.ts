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

    // 0) Datum-Check: frühestens morgen buchbar
    const todayMidnight = new Date();
    todayMidnight.setHours(23, 59, 59, 999);
    if (new Date(start) <= todayMidnight) {
      return NextResponse.json(
        { error: "Buchungen sind frühestens für morgen möglich." },
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

    // 3) Überschneidungs-Check: hat der Lehrer bereits eine aktive Buchung in diesem Zeitraum?
    const startDate = new Date(start);
    const endDate = new Date(end);

    const ACTIVE_STATUSES = [
      "pending",
      "checkout_started",
      "payment_method_saved",
      "paid",
    ];

    const overlap = await prisma.booking.findFirst({
      where: {
        teacherId: teacher.id,
        status: { in: ACTIVE_STATUSES },
        start: { lt: endDate },
        end: { gt: startDate },
      },
      select: { id: true, start: true, end: true },
    });

    if (overlap) {
      const fmt = (d: Date) =>
        d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
      return NextResponse.json(
        {
          error: `Dieser Zeitraum überschneidet sich mit einer bestehenden Buchung (${fmt(overlap.start)}–${fmt(overlap.end)}). Bitte wähle einen anderen Zeitpunkt.`,
        },
        { status: 409 }
      );
    }

    // 4) Student finden oder anlegen
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

    // 5) Preis berechnen: 33 € pro Stunde
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60_000;
    const priceCents = Math.round((durationMinutes / 60) * 33 * 100);

    // 6) Booking erstellen
    const booking = await prisma.booking.create({
      data: {
        teacherId: teacher.id,
        studentId: student.id,
        start: startDate,
        end: endDate,
        priceCents,
        currency: "eur",
        status: "pending",
        note,
        availabilityId: availabilityId || null,
      },
      select: { id: true, status: true, priceCents: true },
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
