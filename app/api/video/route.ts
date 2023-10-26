import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate"
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;
    // check if authenticated: if userId exists
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }
    // check if there are still free trials for the user
    const stillOnFreeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!stillOnFreeTrial && !isPro) {
      return new NextResponse(
        "Free trial has expired. Please upgrade to pro.",
        { status: 403 }
      );
    }

    const response = await replicate.run(
      "anotherjesse/zeroscope-v2-xl:71996d331e8ede8ef7bd76eba9fae076d31792e4ddf4ad057779b443d6aea62f",
      {
        input: {
          prompt,
        },
      }
    );
    // increment api limit if not pro
    if (!isPro) {
      await incrementApiLimit();
    }
    return NextResponse.json(response);
  } catch (error) {
    console.log("[MUSIC_ERROR]: ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
