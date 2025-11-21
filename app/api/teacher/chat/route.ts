// app/api/teacher/chats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email fehlt" }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Lehrer nicht gefunden" }, { status: 404 });
    }

    const chats = await prisma.chat.findMany({
      where: { teacherId: teacher.id },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ chats });
  } catch (err) {
    console.error("GET /api/teacher/chats error:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
