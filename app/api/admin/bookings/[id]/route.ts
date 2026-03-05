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
  const exists = await prisma.booking.findUnique({ where: { id } });
  if (!exists) return NextResponse.json({ error: "Buchung nicht gefunden." }, { status: 404 });

  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (cookies().get("admin_auth")?.value !== "1") return unauthorized();

  const { id } = params;
  const { status } = await req.json();

  if (!status) return NextResponse.json({ error: "status fehlt." }, { status: 400 });

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, booking: updated });
}
