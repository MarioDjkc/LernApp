import { NextRequest } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // wichtig: Edge funktioniert NICHT
export const config = {
  api: {
    bodyParser: false, // App router ignoriert das, aber schadet nicht
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") as string;
  const rawBody = await req.text(); // WICHTIG: Raw body holen

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Event-Type Routing
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Payment completed", session);
      break;
    }
    case "invoice.payment_failed": {
      console.log("Invoice failed");
      break;
    }
    case "customer.subscription.deleted": {
      console.log("Subscription canceled");
      break;
    }
  }

  return new Response("OK", { status: 200 });
}