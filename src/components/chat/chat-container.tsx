"use client";

import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { WelcomeScreen } from "./welcome-screen";
import { useChat, type ChatMessage } from "@/hooks/use-chat";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

interface ChatContainerProps {
  chatId: string;
  initialMessages: ChatMessage[];
  title?: string;
}

export function ChatContainer({
  chatId,
  initialMessages,
  title,
}: ChatContainerProps) {
  const {
    messages,
    isStreaming,
    streamingContent,
    streamingProducts,
    sendMessage,
    stopStreaming,
  } = useChat(chatId, initialMessages);

  const scrollRef = useAutoScroll([
    messages,
    streamingContent,
    streamingProducts,
  ]);

  return (
    <div className="flex h-[100dvh] flex-col md:h-full">
      <ChatHeader title={title} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4"
      >
        {messages.length === 0 && !isStreaming ? (
          <WelcomeScreen onSuggestionClick={sendMessage} />
        ) : (
          <ChatMessages
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            streamingProducts={streamingProducts}
          />
        )}
      </div>
      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        onStop={stopStreaming}
      />
    </div>
  );
}
