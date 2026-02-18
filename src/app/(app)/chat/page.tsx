"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create a new chat automatically
    async function init() {
      try {
        const res = await fetch("/api/chats", { method: "POST" });
        if (res.ok) {
          const chat = await res.json();
          setChatId(chat.id);
          // Replace URL without full navigation
          window.history.replaceState(null, "", `/chat/${chat.id}`);
        }
      } catch (error) {
        console.error("Failed to create chat:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading || !chatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return <ChatContainer chatId={chatId} initialMessages={[]} />;
}
