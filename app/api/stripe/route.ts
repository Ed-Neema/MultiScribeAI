import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

// This is the route that Stripe will redirect to after the user has checkout
const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    //find user's subscription from prisma
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    // if user has active subscription, redirect to the stripe billing portal
    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });
      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    // if no stripe subscription, create a checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0].emailAddress, //clark has an array of emails, pick first
      payment_method_types: ["card"],
      mode: "subscription",
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "MultiScribeAI Pro",
              description: "Unlimited AI Generations",
            },
            unit_amount: 1000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,//used by hook that will  create a subscription in prisma
      },
    });
    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    console.log("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
