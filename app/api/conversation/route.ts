import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { Configuration, OpenAIApi } from "openai-edge";
// import { OpenAIStream, StreamingTextResponse } from "openai-edge";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { generateCompletionStream } from "./openai";
import { StreamingTextResponse } from "ai";
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);


export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;
    // check if authenticated: if userId exists
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!config.apiKey) {
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

    // Generate the OpenAI completion stream
    const stream = await generateCompletionStream(messages);
    // increment api limit if not pro
    if (!isPro) {
      await incrementApiLimit();
    }
    // Send the stream to the client
    return stream;
    // console.log("from server", completion);
    // return NextResponse.json(completion);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]: ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
