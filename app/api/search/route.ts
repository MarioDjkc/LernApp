import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Hilfsfunktion: sauber & tolerant suchen
function normalize(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = normalize(searchParams.get("subject") || "");

  // Alle Lehrer holen
  const teachers = await prisma.teacher.findMany();

  // Falls kein Suchbegriff: alle zurückgeben
  if (!query) {
    return NextResponse.json({ data: teachers });
  }

  // Fuzzy-Suche
  const filtered = teachers.filter((t: any) => {
    const subj = normalize(t.subject || "");

    return (
      subj.includes(query) ||     // "mathe" -> "mathematik"
      query.includes(subj) ||     // falls jemand "mathematik" eingibt
      subj.startsWith(query) ||   // "bio" -> "biologie"
      query.startsWith(subj)      // reverse
    );
  });

  return NextResponse.json({ data: filtered });
}
