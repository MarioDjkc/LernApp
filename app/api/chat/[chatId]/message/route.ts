import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Nachrichten laden
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
    console.error(err);
    return NextResponse.json(
      { error: "Fehler beim Laden der Nachrichten" },
      { status: 500 }
    );
  }
}

// Nachricht senden
export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { sender, text } = await req.json();

    if (!sender || !text) {
      return NextResponse.json(
        { error: "sender & text benötigt" },
        { status: 400 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        chatId: params.chatId,
        sender,
        text,
      },
    });

    return NextResponse.json({ message });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Fehler beim Senden" },
      { status: 500 }
    );
  }
}
