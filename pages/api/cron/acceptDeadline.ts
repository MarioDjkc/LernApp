// pages/api/cron/teacherDeadline.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { Booking } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

    // Alle Buchungen, die NICHT bestätigt wurden
    const outdatedBookings: Booking[] = await prisma.booking.findMany({
      where: {
        createdAt: { lt: cutoff },
        status: {
          in: ["pending", "checkout_started", "payment_method_saved"],
        },
      },
    });

    // Massenupdate
    const updated = await prisma.booking.updateMany({
      where: {
        createdAt: { lt: cutoff },
        status: {
          in: ["pending", "checkout_started", "payment_method_saved"],
        },
      },
      data: {
        status: "canceled_by_system",
      },
    });

    res.json({
      success: true,
      message: `${updated.count} bookings canceled.`,
      canceledBookings: outdatedBookings.map(b => b.id),
    });
  } catch (err: any) {
    console.error("Cronjob error:", err);
    return res.status(500).json({ error: err.message });
  }
}
