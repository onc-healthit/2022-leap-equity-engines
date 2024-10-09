import { LangChainAdapter, Message } from "ai";
import { RemoteRunnable } from "langchain/runnables/remote";
import { RunnableConfig } from "node_modules/@langchain/core/dist/runnables/types";

// Allow streaming responses up to 30 seconds
export const maxDuration = 240;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const latestAttachement = (messages as Message[]).findLast((message) => message.experimental_attachments?.length);

  if (!latestAttachement) return;

  const chain = new RemoteRunnable<{ image_data: string }, string, RunnableConfig>({
    url: "https://snomed-llm-461966861467.us-central1.run.app/snomed",
    options: { timeout: 240000 },
  });

  const stream = await chain.stream({ image_data: latestAttachement.experimental_attachments![0].url });

  return LangChainAdapter.toDataStreamResponse(stream);
}
