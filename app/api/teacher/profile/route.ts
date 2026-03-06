// app/api/teacher/profile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "email fehlt" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        subject: true,
        unterstufeOnly: true,
        schoolTrack: true,
        allowedForms: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: teacher });
  } catch (err) {
    console.error("GET /api/teacher/profile error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
