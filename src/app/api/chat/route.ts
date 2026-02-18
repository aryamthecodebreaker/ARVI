import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGenAI, GEMINI_MODEL, searchAmazonFunctionDeclaration } from "@/lib/gemini";
import { ARVI_SYSTEM_PROMPT } from "@/lib/constants";
import { buildGeminiContents, formatPreferences, extractAndUpdatePreferences } from "@/lib/chat-helpers";
import { searchAmazon, summarizeForGemini } from "@/lib/scrapingdog";
import type { MappedProduct } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  let chatId: string;
  let message: string;

  try {
    const body = await request.json();
    chatId = body.chatId;
    message = body.message;
  } catch {
    return new Response("Invalid request", { status: 400 });
  }

  if (!chatId || !message) {
    return new Response("chatId and message required", { status: 400 });
  }

  // Verify chat ownership
  const chat = await prisma.chat.findUnique({
    where: { id: chatId, userId: session.user.id },
  });
  if (!chat) {
    return new Response("Chat not found", { status: 404 });
  }

  // Save user message
  await prisma.message.create({
    data: { chatId, role: "USER", content: message },
  });

  // Get chat history
  const history = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: { products: true },
  });

  // Get user preferences
  const preferences = await prisma.userPreference.findUnique({
    where: { userId: session.user.id },
  });

  // Build system prompt with preferences
  const systemPrompt = ARVI_SYSTEM_PROMPT.replace(
    "{USER_PREFERENCES}",
    formatPreferences(preferences)
  );

  // Build Gemini conversation history
  const geminiContents = buildGeminiContents(history);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullText = "";
        let products: MappedProduct[] = [];

        // Call Gemini with streaming
        const response = await getGenAI().models.generateContent({
          model: GEMINI_MODEL,
          contents: geminiContents,
          config: {
            systemInstruction: systemPrompt,
            tools: [
              { functionDeclarations: [searchAmazonFunctionDeclaration] },
            ],
          },
        });

        // Check for function calls
        const functionCalls = response.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
          const fc = functionCalls[0];

          if (fc.name === "search_amazon") {
            const args = fc.args as { query: string; maxResults?: number };

            // Execute the search
            try {
              const searchResults = await searchAmazon(
                args.query,
                args.maxResults || 5
              );
              products = searchResults;

              // Send products to client
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "products", products })}\n\n`
                )
              );

              // Send function response back to Gemini for summary
              const finalResponse = await getGenAI().models.generateContent({
                model: GEMINI_MODEL,
                contents: [
                  ...geminiContents,
                  {
                    role: "model" as const,
                    parts: [{ functionCall: { name: fc.name, args: fc.args } }],
                  },
                  {
                    role: "user" as const,
                    parts: [
                      {
                        functionResponse: {
                          name: fc.name,
                          response: {
                            products: searchResults.map(summarizeForGemini),
                          },
                        },
                      },
                    ],
                  },
                ],
                config: {
                  systemInstruction: systemPrompt,
                  tools: [
                    {
                      functionDeclarations: [searchAmazonFunctionDeclaration],
                    },
                  ],
                },
              });

              fullText = finalResponse.text || "";

              // Stream the text in chunks for a typing effect
              const words = fullText.split(" ");
              let sent = "";
              for (let i = 0; i < words.length; i += 3) {
                const chunk = words.slice(i, i + 3).join(" ") + " ";
                sent += chunk;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`
                  )
                );
                // Small delay for typing effect
                await new Promise((resolve) => setTimeout(resolve, 30));
              }
            } catch (searchError) {
              console.error("Search error:", searchError);
              fullText =
                "I'm sorry, I had trouble searching for products right now. Could you try again or rephrase your request?";
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", content: fullText })}\n\n`
                )
              );
            }
          }
        } else {
          // No function call - just text response
          fullText = response.text || "";

          // Stream in chunks
          const words = fullText.split(" ");
          for (let i = 0; i < words.length; i += 3) {
            const chunk = words.slice(i, i + 3).join(" ") + " ";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`
              )
            );
            await new Promise((resolve) => setTimeout(resolve, 30));
          }
        }

        // Save assistant message + products to DB
        const savedMessage = await prisma.message.create({
          data: {
            chatId,
            role: "ASSISTANT",
            content: fullText,
            products: {
              create: products.map((p, i) => ({
                asin: p.asin,
                title: p.title,
                price: p.price,
                priceString: p.priceString,
                image: p.image,
                url: p.url,
                rating: p.rating,
                reviewCount: p.reviewCount,
                isPrime: p.isPrime,
                summary: p.summary,
                position: i,
              })),
            },
          },
        });

        // Update chat title if first message
        const assistantCount = history.filter(
          (m) => m.role === "ASSISTANT"
        ).length;
        if (assistantCount === 0) {
          await prisma.chat.update({
            where: { id: chatId },
            data: { title: message.substring(0, 100) },
          });
        }

        // Update timestamp
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });

        // Send done event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done", messageId: savedMessage.id })}\n\n`
          )
        );

        // Async preference extraction (fire and forget)
        extractAndUpdatePreferences(session.user!.id!, message, fullText).catch(
          () => {}
        );

        controller.close();
      } catch (error) {
        console.error("Chat API error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Something went wrong. Please try again." })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
}
