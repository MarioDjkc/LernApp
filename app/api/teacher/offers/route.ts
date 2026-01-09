// app/api/teacher/offers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { data: [], error: "email fehlt" },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { data: [], error: "Teacher nicht gefunden" },
        { status: 404 }
      );
    }

    const offers = await prisma.teachingOffer.findMany({
      where: { teacherId: teacher.id },
      orderBy: { createdAt: "desc" },
      include: {
        subject: true,
      },
    });

    return NextResponse.json({ data: offers });
  } catch (err) {
    console.error("GET /api/teacher/offers error:", err);
    return NextResponse.json(
      { data: [], error: "Serverfehler" },
      { status: 500 }
    );
  }
}
