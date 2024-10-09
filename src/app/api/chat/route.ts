import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import systemText from "./values_assistent.txt"; // substitute this path with your README.md file path
import { format } from "util";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  const currentYear = new Date().getFullYear();

  // Call the language model
  const result = await streamText({
    model: openai("gpt-4o"),
    system: format(systemText, currentYear.toString()),
    messages: convertToCoreMessages(messages),
  });

  // Respond with the stream
  return result.toDataStreamResponse();
}
