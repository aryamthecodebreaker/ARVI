"use client";

import { useRouter, useParams } from "next/navigation";
import { Plus, MessageSquare, Trash2, Bot, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/use-chats";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/auth/user-avatar";

export function ChatSidebar() {
  const router = useRouter();
  const params = useParams();
  const activeChatId = params?.chatId as string | undefined;
  const { chats, loading, createChat, deleteChat } = useChats();

  const handleNewChat = async () => {
    const chat = await createChat();
    if (chat) {
      router.push(`/chat/${chat.id}`);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    const success = await deleteChat(chatId);
    if (success && activeChatId === chatId) {
      router.push("/chat");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">Arvi</span>
        </div>
        <Button
          onClick={handleNewChat}
          size="sm"
          className="h-8 gap-1.5 bg-indigo-600 text-xs hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-400">No chats yet</p>
            <p className="text-xs text-gray-400">
              Start a new chat with Arvi
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className={`group flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-100 ${
                  activeChatId === chat.id ? "bg-indigo-50" : ""
                }`}
              >
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-700">
                    {chat.title}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(chat.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="hidden shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 group-hover:block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-3 py-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <UserAvatar className="h-6 w-6" />
          <span className="flex-1 truncate text-left text-xs">Sign out</span>
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
