// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

function isValidISODateTime(value: string) {
  return typeof value === "string" && value.includes("T");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const teacherId = body?.teacherId as string | undefined;
    const studentEmail = body?.studentEmail as string | undefined;
    const studentName = body?.studentName as string | undefined;
    const start = body?.start as string | undefined;
    const end = body?.end as string | undefined;

    // ✅ NEU: note
    const noteRaw = body?.note as string | undefined;
    const note = noteRaw?.trim() ? noteRaw.trim() : null;

    // optional: wenn du beim Buchen den Slot löschen willst
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
      return NextResponse.json(
        { error: "Teacher nicht gefunden" },
        { status: 404 }
      );
    }

    // 2) Student finden oder anlegen
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

    // 3) Booking + Slot löschen in einer Transaktion
    const booking = await prisma.$transaction(async (tx) => {
      // optional: Slot löschen (damit er verschwindet)
      if (availabilityId) {
        await tx.availability.delete({
          where: { id: availabilityId },
        });
      }

      const created = await tx.booking.create({
        data: {
          teacherId: teacher.id,
          studentId: student.id,
          start: new Date(start),
          end: new Date(end),
          priceCents: 0,
          currency: "eur",
          status: "pending",

          // ✅ NEU
          note,
        },
      });

      return created;
    });

    return NextResponse.json({ ok: true, booking });
  } catch (err: any) {
    console.error("POST /api/bookings error:", err);

    if (err?.code === "P2003") {
      return NextResponse.json(
        { error: "Foreign Key Fehler: teacherId oder studentId existiert nicht in der DB." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
