"use client";

import { MessageBubble, StreamingBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/hooks/use-chat";
import type { MappedProduct } from "@/lib/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  streamingProducts: MappedProduct[];
}

export function ChatMessages({
  messages,
  isStreaming,
  streamingContent,
  streamingProducts,
}: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-4 py-4">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isStreaming && streamingContent && (
        <StreamingBubble
          content={streamingContent}
          products={streamingProducts}
        />
      )}
      {isStreaming && !streamingContent && <TypingIndicator />}
    </div>
  );
}
