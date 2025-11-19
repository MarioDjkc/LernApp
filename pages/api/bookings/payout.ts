import { prisma } from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { bookingId } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { teacher: true },
  });

  if (!booking || !booking.teacher.stripeAccountId) {
    return res.status(400).json({ error: "Teacher has no Stripe account" });
  }

  // Beispiel: Lehrer bekommt 70%
  const teacherAmount = Math.round(booking.priceCents * 0.6);

  const transfer = await stripe.transfers.create({
    amount: teacherAmount,
    currency: "eur",
    destination: booking.teacher.stripeAccountId,
    transfer_group: booking.id,
  });

  // Markiere Booking als "teacher_paid"
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "teacher_paid" },
  });

  res.status(200).json({ transfer });
}
