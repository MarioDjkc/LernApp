import { prisma } from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teacherId } = req.body;

  const account = await stripe.accounts.create({
    type: "express",
  });

  //DB
  //Table Teacher
  //Add stripeAccounteId
  await prisma.teacher.update({
    where: { id: teacherId },
    data: { stripeAccountId: account.id },
  });

  res.status(200).json({ accountId: account.id });
}
