import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "id fehlt" }, { status: 400 });
    }

    await prisma.availability.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/teacher/availability/delete error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
