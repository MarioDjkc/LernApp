// app/api/subjects/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: subjects });
  } catch (err) {
    console.error("GET /api/subjects error:", err);
    return NextResponse.json({ data: [], error: "Serverfehler" }, { status: 500 });
  }
}
