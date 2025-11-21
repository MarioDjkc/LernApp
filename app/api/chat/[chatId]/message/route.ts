import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// 🔹 Nachrichten abrufen
export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { chatId: params.chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("GET /api/chats/[chatId]/messages error:", err);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

// 🔹 Nachricht senden
export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { sender, text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text fehlt" }, { status: 400 });
    }

    const msg = await prisma.chatMessage.create({
      data: {
        chatId: params.chatId,
        sender,
        text,
      },
    });

    return NextResponse.json({ ok: true, message: msg });
  } catch (err) {
    console.error("POST /api/chats/[chatId]/messages error:", err);
    return NextResponse.json({ error: "Fehler beim Senden" }, { status: 500 });
  }
}
