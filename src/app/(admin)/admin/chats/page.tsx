"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ChatItem {
  id: string;
  title: string;
  updatedAt: string;
  user: { name: string | null; email: string | null; image: string | null };
  _count: { messages: number };
}

export default function AdminChatsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (userId) params.set("userId", userId);

    fetch(`/api/admin/chats?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setChats(data.chats);
        setTotalPages(data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, userId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {userId ? "User Chats" : "All Chats"}
        </h1>
        {userId && (
          <Link href="/admin/chats">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="divide-y">
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Loading...
              </p>
            ) : chats.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No chats found
              </p>
            ) : (
              chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/admin/chats/${chat.id}`}
                  className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-4 px-4 rounded transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={chat.user.image || ""} />
                    <AvatarFallback>
                      {chat.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chat.user.name || chat.user.email} &middot;{" "}
                      {chat._count.messages} messages
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatDistanceToNow(new Date(chat.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </Link>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
