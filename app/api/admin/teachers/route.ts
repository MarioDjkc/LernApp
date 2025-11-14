// app/api/admin/teachers/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs"; // ENV sicher laden

export async function POST(req: Request) {
  try {
    const envKey = (process.env.ADMIN_KEY ?? "").trim();
    if (!envKey) {
      return NextResponse.json({ error: "Server: ADMIN_KEY fehlt." }, { status: 500 });
    }

    // ✅ Admin-Auth: akzeptiere Cookie ODER Header
    const cookieAuth = cookies().get("admin_auth")?.value === "1";
    const headerKey = req.headers.get("x-admin-key")?.trim();
    const headerAuth = headerKey && headerKey === envKey;
    if (!cookieAuth && !headerAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, subject, rating, avatarUrl } = body ?? {};

    if (!id || !name || !subject || typeof rating !== "number") {
      return NextResponse.json(
        { error: "Felder id, name, subject, rating sind Pflicht." },
        { status: 400 }
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating muss 1–5 sein." }, { status: 400 });
    }

    // doppelte ID verhindern
    const exists = await prisma.teacher.findUnique({ where: { id } });
    if (exists) {
      return NextResponse.json({ error: "Lehrer-ID existiert bereits." }, { status: 409 });
    }

    const created = await prisma.teacher.create({
      data: { id, name, subject, rating, avatarUrl: avatarUrl ?? null },
      select: { id: true, name: true, subject: true, rating: true, avatarUrl: true },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (err) {
    console.error("POST /api/admin/teachers error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
