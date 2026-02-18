"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCarousel } from "@/components/products/product-carousel";
import Link from "next/link";
import type { MappedProduct } from "@/lib/types";

interface ChatDetail {
  id: string;
  title: string;
  user: { name: string | null; email: string | null; image: string | null };
  messages: {
    id: string;
    role: string;
    content: string;
    createdAt: string;
    products: MappedProduct[];
  }[];
}

export default function AdminChatViewerPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const [chat, setChat] = useState<ChatDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/chats/${chatId}`)
      .then((res) => res.json())
      .then(setChat)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [chatId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-400">Loading chat...</p>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-400">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/chats">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarImage src={chat.user.image || ""} />
          <AvatarFallback>
            {chat.user.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{chat.title}</h1>
          <p className="text-xs text-gray-500">
            {chat.user.name || chat.user.email}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4 rounded-xl border bg-white p-4">
        {chat.messages
          .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
          .map((msg) => {
            const isUser = msg.role === "USER";
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "rounded-br-sm bg-indigo-600 text-white"
                        : "rounded-tl-sm bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {!isUser && msg.products && msg.products.length > 0 && (
                    <ProductCarousel products={msg.products} />
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
