// app/api/chat/[chatId]/messages/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

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
    console.error("GET messages error:", err);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { sender, text } = await req.json();

    const msg = await prisma.chatMessage.create({
      data: {
        chatId: params.chatId,
        sender,
        text,
      },
    });

    return NextResponse.json({ message: msg });
  } catch (err) {
    console.error("POST message error:", err);
    return NextResponse.json({ error: "Fehler beim Senden" }, { status: 500 });
  }
}
