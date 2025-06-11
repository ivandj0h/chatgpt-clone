import { openai } from "@ai-sdk/openai"
import { streamText, convertToCoreMessages } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, model = "gpt-4o", data } = await req.json()

    // Handle messages with images
    let processedMessages = messages

    // If we have data with content (images), process the last message
    if (data?.content) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage) {
        processedMessages = [
          ...messages.slice(0, -1),
          {
            ...lastMessage,
            content: data.content,
          },
        ]
      }
    }

    console.log("Processing messages:", JSON.stringify(processedMessages, null, 2))

    const result = streamText({
      model: openai(model),
      messages: convertToCoreMessages(processedMessages),
      temperature: 0.7,
      maxTokens: 4000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
