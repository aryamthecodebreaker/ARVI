import type { Message, Product, Chat, User, UserPreference } from "@prisma/client";

export type MessageWithProducts = Message & {
  products: Product[];
};

export type ChatWithMessages = Chat & {
  messages: MessageWithProducts[];
};

export type ChatListItem = Chat & {
  messages: { content: string; createdAt: Date }[];
  _count: { messages: number };
};

export type UserWithStats = User & {
  _count: { chats: number };
};

export type SSEEvent =
  | { type: "text"; content: string }
  | { type: "products"; products: MappedProduct[] }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string };

export interface MappedProduct {
  asin: string;
  title: string;
  price: number | null;
  priceString: string;
  image: string | null;
  url: string;
  rating: number | null;
  reviewCount: number | null;
  isPrime: boolean;
  summary: string | null;
}
