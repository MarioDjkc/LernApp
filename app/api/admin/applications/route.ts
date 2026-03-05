import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const applications = await prisma.teacherApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}

export async function DELETE(req: Request) {
  if (cookies().get("admin_auth")?.value !== "1") return unauthorized();

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id fehlt." }, { status: 400 });

  await prisma.teacherApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
