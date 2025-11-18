// app/api/teachers/list/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

// GET /api/teachers/list
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: teachers });
  } catch (err) {
    console.error("GET /api/teachers/list error:", err);
    return NextResponse.json(
      { data: [], error: "ServerFehler" },
      { status: 500 }
    );
  }
}
