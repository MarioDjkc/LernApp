import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (cookies().get("admin_auth")?.value !== "1") return unauthorized();

  const { id } = params;
  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) return NextResponse.json({ error: "Schüler nicht gefunden." }, { status: 404 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
