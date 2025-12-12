import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "teacherId fehlt" },
        { status: 400 }
      );
    }

    const slots = await prisma.availability.findMany({
      where: { teacherId },
      orderBy: [
        { date: "asc" },
        { start: "asc" },
      ],
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("student availability error:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
