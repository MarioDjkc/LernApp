// app/api/admin/teachers/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs"; // ENV sicher laden

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        mustChangePassword: true,
        _count: { select: { bookings: true, availabilities: true } },
      },
    });

    return NextResponse.json({ teachers });
  } catch (err: any) {
    console.error("GET /api/admin/teachers error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const { id, name, subject } = body ?? {};

    if (!id || !name || !subject) {
      return NextResponse.json(
        { error: "Felder id, name und subject sind Pflicht." },
        { status: 400 }
      );
    }

    // doppelte ID verhindern
    const exists = await prisma.teacher.findUnique({ where: { id } });
    if (exists) {
      return NextResponse.json({ error: "Lehrer-ID existiert bereits." }, { status: 409 });
    }

    const created = await prisma.teacher.create({
      data: { id, name, subject, password: "", mustChangePassword: true },
      select: { id: true, name: true, subject: true },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (err) {
    console.error("POST /api/admin/teachers error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
