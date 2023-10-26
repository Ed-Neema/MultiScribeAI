import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
/**
 * 
  This function is used to handle incoming webhook events from Stripe, a payment processing platform.
 */
export async function POST(req: Request) {
  const body = await req.text();
  //    retrieves the Stripe signature from the request headers using headers().get("Stripe-Signature")
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;
  //construct a Stripe event object using stripe.webhooks.constructEvent(), passing in the request body, signature, and the Stripe webhook secret. If the event cannot be constructed, the function returns a NextResponse object with a 400 status code and an error message.
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  //If the event is successfully constructed, the function checks the type of the event. If the event type is checkout.session.completed, the function retrieves the subscription object from Stripe using stripe.subscriptions.retrieve().

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    //It then checks if the userId metadata is present in the session object. If it is not present, the function returns a NextResponse object with a 400 status code and an error message.

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }
    //If the userId metadata is present, the function creates a new user subscription record in the database using prismadb.userSubscription.create().
    await prismadb.userSubscription.create({
      data: {
        userId: session?.metadata?.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }
  //If the event type is invoice.payment_succeeded, the function retrieves the subscription object from Stripe using stripe.subscriptions.retrieve(). It then updates the user subscription record in the database using prismadb.userSubscription.update().
  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }
//   Finally, the function returns a NextResponse object with a 200 status code.

  return new NextResponse(null, { status: 200 });
};

//you will need to simulate the webhook for development purposes. Go to stripe
// will have to install stripe cli authenticate and run stripe listen --forward-to localhost:3000/api/webhook