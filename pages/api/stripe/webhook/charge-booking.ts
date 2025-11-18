import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { amount, customerId, paymentMethodId } = req.body;

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,   // ⭐ Karte im Hintergrund belasten
      confirm: true,       // Versuch die Zahlung sofort
    });

    res.status(200).json({ success: true, status: intent.status });
  } catch (err: any) {
    // Falls SCA notwendig ist
    res.status(400).json({
      error: err.message,
      requires_action: err.code === "authentication_required",
      intent_client_secret: err.payment_intent?.client_secret,
    });
  }
}
