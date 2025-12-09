import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req, context) {
  try {
    const { chatId } = await context.params;  // 🔥 FIX: params awaiten!

    if (!chatId) {
      return NextResponse.json(
        { error: "ChatId fehlt" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json(
        { error: "Chat nicht gefunden" },
        { status: 404 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      messages,
      studentEmail: chat.studentEmail,
    });
  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function POST(req, context) {
  try {
    const { chatId } = await context.params; // 🔥 FIX

    const { sender, text } = await req.json();

    const newMessage = await prisma.chatMessage.create({
      data: {
        chatId,
        sender,
        text,
      },
    });

    return NextResponse.json({ newMessage });
  } catch (error) {
    console.error("POST messages error:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
