// pages/api/bookings/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { studentEmail, studentName, teacherId, start, end, priceCents } = req.body;

    // 1) Erstelle (oder finde) student user in DB
    let student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student) {
      student = await prisma.user.create({
        data: { email: studentEmail, name: studentName || undefined },
      });
    }

    // 2) Booking speichern (vorerst pending)
    const booking = await prisma.booking.create({
      data: {
        studentId: student.id,
        teacherId,
        start: new Date(start),
        end: new Date(end),
        priceCents,
        currency: "eur",
        status: "pending",
      },
    });

    // 3) Erstelle Checkout Session (mode=setup). Verwende customer_creation: "always" so Stripe erzeugt Customer automatisch
    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer_creation: "always",
      payment_method_types: ["card", "sepa_debit"],
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?booking=${booking.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cancel?booking=${booking.id}`,
      metadata: {
        bookingId: booking.id,
      },
    });

    // set booking status to checkout_started and save session id optionally
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "checkout_started" },
    });

    res.status(200).json({ url: session.url, bookingId: booking.id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
