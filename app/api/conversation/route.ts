import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
export const runtime = "edge";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;
    // check if authenticated: if userId exists
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!openai.apiKey) {
      return new NextResponse("OpenAI API Key not configured.", {
        status: 500,
      });
    }
    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    // check if there are still free trials for the user
    const stillOnFreeTrial = await checkApiLimit();

    if (!stillOnFreeTrial) {
      return new NextResponse("Free trial has expired", { status: 403 });
    }
    const isPro = await checkSubscription();
    if (!stillOnFreeTrial && !isPro) {
      return new NextResponse(
        "Free trial has expired. Please upgrade to pro.",
        { status: 403 }
      );
    }


    const response = await openai.chat.completions.create({
      messages,
      model: "gpt-3.5-turbo",
    });
    // increment api limit if not pro
    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]: ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
