import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { bookingId } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: "setup",                 // ⭐ WICHTIG!
    customer_creation: "always",
    payment_method_types: ["card"],
    success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/success?booking=${bookingId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/cancel?booking=${bookingId}`,
  });

  res.status(200).json({ url: session.url });
}
