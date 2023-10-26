import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId } = auth();
    const body = await req.json();
    // remember to set default values
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }
    // check if there are still free trials for the user
    const stillOnFreeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!stillOnFreeTrial && !isPro) {
      return new NextResponse(
        "Free trial has expired  Please upgrade to pro.",
        { status: 403 }
      );
    }

    const response = await openai.images.generate({
      prompt,
      n: parseInt(amount, 10),
      size: resolution,
    });
    // increment api limit if not pro
    if (!isPro) {
      await incrementApiLimit();
    }
    return NextResponse.json(response.data);
  } catch (error) {
    console.log("[IMAGE_ERROR]: ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
