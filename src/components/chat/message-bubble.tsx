"use client";

import { Bot } from "lucide-react";
import { ProductCarousel } from "@/components/products/product-carousel";
import type { ChatMessage } from "@/hooks/use-chat";
import type { MappedProduct } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "USER";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-1`}>
      {!isUser && (
        <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white mt-1">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={`max-w-[85%] space-y-2 ${isUser ? "max-w-[75%]" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "rounded-br-sm bg-indigo-600 text-white"
              : "rounded-tl-sm bg-gray-100 text-gray-900"
          }`}
        >
          {message.content}
        </div>
        {!isUser && message.products && message.products.length > 0 && (
          <ProductCarousel products={message.products} />
        )}
      </div>
    </div>
  );
}

interface StreamingBubbleProps {
  content: string;
  products: MappedProduct[];
}

export function StreamingBubble({ content, products }: StreamingBubbleProps) {
  return (
    <div className="flex justify-start px-1">
      <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white mt-1">
        <Bot className="h-4 w-4" />
      </div>
      <div className="max-w-[85%] space-y-2">
        {content && (
          <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5 text-sm leading-relaxed text-gray-900 whitespace-pre-wrap">
            {content}
            <span className="inline-block h-4 w-0.5 animate-pulse bg-indigo-600 ml-0.5" />
          </div>
        )}
        {products.length > 0 && <ProductCarousel products={products} />}
      </div>
    </div>
  );
}
