// app/api/teachers/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { logError } from "@/app/lib/logError";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const { id } = params;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Lehrer nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: teacher });
  } catch (err) {
    logError("app/api/teachers/[id] GET", err).catch(() => {});
    console.error("GET /api/teachers/[id] error:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
