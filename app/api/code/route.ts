import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export const runtime = "edge"
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// create an instruction message to tell openAI how to respond
const instructionMessage: ChatCompletionMessageParam = {
  role: "system",
  content:
    "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations.",
};
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
    const isPro = await checkSubscription();
    if (!stillOnFreeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Upgrade to pro", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      messages: [instructionMessage, ...messages],
      model: "gpt-3.5-turbo",
    });
    // increment api limit if not pro
    if (!isPro) {
      await incrementApiLimit();
    }
    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CODE_ERROR]: ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
