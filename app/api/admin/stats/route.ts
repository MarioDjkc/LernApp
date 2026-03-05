import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const [teachers, students, bookings, applications] = await Promise.all([
    prisma.teacher.count(),
    prisma.user.count(),
    prisma.booking.count(),
    prisma.teacherApplication.count(),
  ]);

  const paidRevenue = await prisma.booking.aggregate({
    where: { status: "paid" },
    _sum: { priceCents: true },
  });

  const pendingBookings = await prisma.booking.count({
    where: { status: { in: ["pending", "checkout_started", "accepted"] } },
  });

  return NextResponse.json({
    teachers,
    students,
    bookings,
    applications,
    pendingBookings,
    totalRevenueCents: paidRevenue._sum.priceCents ?? 0,
  });
}
