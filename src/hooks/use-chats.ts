"use client";

import { useState, useEffect, useCallback } from "react";

interface ChatItem {
  id: string;
  title: string;
  updatedAt: string;
  _count: { messages: number };
  messages: { content: string; createdAt: string }[];
}

export function useChats() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const createChat = useCallback(async () => {
    try {
      const res = await fetch("/api/chats", { method: "POST" });
      if (res.ok) {
        const chat = await res.json();
        setChats((prev) => [chat, ...prev]);
        return chat;
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
    return null;
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        return true;
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
    return false;
  }, []);

  return { chats, loading, fetchChats, createChat, deleteChat };
}
