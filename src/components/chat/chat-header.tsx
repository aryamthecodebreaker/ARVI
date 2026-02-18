"use client";

import { Menu, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/auth/user-avatar";
import { useChatStore } from "@/stores/chat-store";

interface ChatHeaderProps {
  title?: string;
}

export function ChatHeader({ title }: ChatHeaderProps) {
  const toggleSidebar = useChatStore((s) => s.toggleSidebar);

  return (
    <div className="flex h-14 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">
              {title || "Arvi"}
            </h2>
            <p className="text-xs text-gray-500">Shopping Assistant</p>
          </div>
        </div>
      </div>
      <UserAvatar className="h-8 w-8" />
    </div>
  );
}
