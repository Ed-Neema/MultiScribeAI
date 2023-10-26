import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { MAX_FREE_COUNTS } from "@/constants";

// function to increase the API count whenever we a user sends a request

export const incrementApiLimit = async () => {
  const { userId } = auth();
  if (!userId) {
    return;
  }
  //   since the user entry isn't added in our db  by default upon sign up , we need to check if the user's record exists first, if yes, add count, if not create it and set count to 1.
  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId: userId },
  });
  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: { userId: userId },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: { userId: userId, count: 1 },
    });
  }
};

// checks if user has reached limit of usage
export const checkApiLimit = async () => {
  const { userId } = auth();

//   if user never created their first generation, return false
  if (!userId) {
    return false;
  }

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId: userId },
  });
// if their record doesn't exist yet(meaning they haven't generated yet) or they are below limit count, return true
  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
    return true;
  } else {
    return false;
  }
};

// gets the count of the user at the moment
export const getApiLimitCount = async () => {
  const { userId } = auth();

  if (!userId) {
    return 0;
  }

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId,
    },
  });

  if (!userApiLimit) {
    return 0;
  }

  return userApiLimit.count;
};