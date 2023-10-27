// import { Configuration, OpenAIApi } from "openai-edge";
// export const runtime = "edge";
// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(config);

// /**
//  * Generates a chat completion using OpenAI's API.
//  * @param messages An array of messages exchanged between the user and the AI.
//  * @param model The name of the OpenAI model to use. Defaults to "gpt-3.5-turbo".
//  * @returns A Promise that resolves to the response from the OpenAI API.
//  */
// export async function generateCompletion(messages, model = "gpt-3.5-turbo") {
//   const response = await openai.createChatCompletion({
//     messages,
//     model,
//   });
// //   return response.data.choices[0].text;
//   return response;
// }

//WITH STREAMS
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
export const runtime = "edge";

export async function generateCompletionStream(
  messages,
  model = "gpt-3.5-turbo"
) {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);
   
  const response = await openai.createChatCompletion({
    messages,
    model,
    stream: true,
  });
  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
  //   return stream;
}

//
