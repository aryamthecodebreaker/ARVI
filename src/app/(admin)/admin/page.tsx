"use client";

import { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  MessagesSquare,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Analytics {
  totalUsers: number;
  totalChats: number;
  totalMessages: number;
  totalProducts: number;
  recentChats: {
    id: string;
    title: string;
    updatedAt: string;
    user: { name: string | null; email: string | null; image: string | null };
    _count: { messages: number };
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 w-16 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <p>Failed to load analytics</p>;

  const stats = [
    {
      label: "Total Users",
      value: data.totalUsers,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Chats",
      value: data.totalChats,
      icon: MessageSquare,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Messages",
      value: data.totalMessages,
      icon: MessagesSquare,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Products Recommended",
      value: data.totalProducts,
      icon: Package,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Chats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Chats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {data.recentChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/admin/chats/${chat.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-4 px-4 rounded transition-colors"
              >
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
            ))}
            {data.recentChats.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">
                No chats yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
