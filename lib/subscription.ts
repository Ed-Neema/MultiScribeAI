import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

const DAY_IN_MS = 86_400_000;

/**
 * 
 * This code defines a function named checkSubscription that checks if the authenticated user has an active subscription. The function first imports the auth function from the @clerk/nextjs package, which is used to retrieve the authenticated user's ID.

Then, the function uses the prismadb library to query the database for the user's subscription information. If the user has no subscription, the function returns false. If the user has a subscription, the function checks if the subscription is valid by comparing the current date to the subscription's stripeCurrentPeriodEnd property, which represents the end of the current billing period. If the subscription is valid, the function returns true.

The code also defines a constant named DAY_IN_MS which represents the number of milliseconds in a day. This constant is used to calculate the end of the current billing period by adding it to the stripeCurrentPeriodEnd property.
 */
export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }
  /**
 * The DAY_IN_MS constant is used to calculate the end of the current billing period. The stripeCurrentPeriodEnd property of the userSubscription object represents the end of the current billing period.

To check if the subscription is still valid, the code adds the DAY_IN_MS constant to the stripeCurrentPeriodEnd property to get the end of the next billing period. If the current date is before the end of the next billing period, then the subscription is still valid.

So, adding DAY_IN_MS to stripeCurrentPeriodEnd allows the code to check if the subscription is still valid by comparing the current date to the end of the next billing period.
 */
  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
      Date.now();

  /**
 * The double exclamation marks in the code are used to convert the value of isValid to a boolean value. The !! operator is a shorthand way of converting any truthy or falsy value to a boolean value.

In this case, the isValid variable is either a Date object or undefined. By using the double exclamation marks, the code converts the isValid variable to a boolean value, where undefined becomes false and any other value becomes true.

So, the return !!isValid statement returns true if isValid is not undefined, and false otherwise.
 */
  return !!isValid;
};
