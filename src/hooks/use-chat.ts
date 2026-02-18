"use client";

import { useState, useCallback, useRef } from "react";
import type { MappedProduct } from "@/lib/types";

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: Date;
  products: MappedProduct[];
}

export function useChat(chatId: string, initialMessages: ChatMessage[]) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingProducts, setStreamingProducts] = useState<MappedProduct[]>(
    []
  );
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "USER",
        content,
        createdAt: new Date(),
        products: [],
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent("");
      setStreamingProducts([]);

      try {
        abortRef.current = new AbortController();
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, message: content }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error("Failed to send message");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let accumulatedProducts: MappedProduct[] = [];

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const data = JSON.parse(jsonStr);

                switch (data.type) {
                  case "text":
                    accumulatedText += data.content;
                    setStreamingContent(accumulatedText);
                    break;
                  case "products":
                    accumulatedProducts = data.products;
                    setStreamingProducts(data.products);
                    break;
                  case "done": {
                    const finalMessage: ChatMessage = {
                      id: data.messageId,
                      role: "ASSISTANT",
                      content: accumulatedText,
                      createdAt: new Date(),
                      products: accumulatedProducts,
                    };
                    setMessages((prev) => [...prev, finalMessage]);
                    setStreamingContent("");
                    setStreamingProducts([]);
                    break;
                  }
                  case "error":
                    console.error("Stream error:", data.message);
                    break;
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Chat error:", error);
          // Add error message
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: "ASSISTANT",
              content:
                "Sorry, something went wrong. Please try again.",
              createdAt: new Date(),
              products: [],
            },
          ]);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        setStreamingProducts([]);
      }
    },
    [chatId, isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    streamingContent,
    streamingProducts,
    sendMessage,
    stopStreaming,
  };
}
