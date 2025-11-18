// pages/api/bookings/confirm.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { bookingId } = req.body;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "payment_method_saved") {
      return res.status(400).json({ error: "Payment method not saved yet" });
    }

    // 1) Erst status auf confirmed setzen
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "confirmed" },
    });

    // 2) SetupIntent abrufen, um PaymentMethod zu bekommen
    const setupIntent = await stripe.setupIntents.retrieve(booking.stripeSetupIntentId!);
    const paymentMethod = setupIntent.payment_method as string;

    // 3) Jetzt SOFORT bezahlen
    const pi = await stripe.paymentIntents.create({
      amount: booking.priceCents,
      currency: booking.currency,
      customer: booking.stripeCustomerId!,
      payment_method: paymentMethod,
      off_session: true,
      confirm: true,
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "paid",
        stripePaymentIntentId: pi.id,
      },
    });

    return res.json({ ok: true, paid: true });

  } catch (err: any) {
    console.error("Payment error:", err);

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "payment_failed" },
    });

    return res.status(400).json({ error: err.message });
  }
}
