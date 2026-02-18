import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatContainer } from "@/components/chat/chat-container";
import type { ChatMessage } from "@/hooks/use-chat";

interface ChatDetailPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { chatId } = await params;

  const chat = await prisma.chat.findUnique({
    where: { id: chatId, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { products: true },
      },
    },
  });

  if (!chat) redirect("/chat");

  const initialMessages: ChatMessage[] = chat.messages
    .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
    .map((m) => ({
      id: m.id,
      role: m.role as "USER" | "ASSISTANT",
      content: m.content,
      createdAt: m.createdAt,
      products: m.products.map((p) => ({
        asin: p.asin,
        title: p.title,
        price: p.price,
        priceString: p.priceString || (p.price ? `₹${p.price}` : "N/A"),
        image: p.image,
        url: p.url,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isPrime: p.isPrime,
        summary: p.summary,
      })),
    }));

  return (
    <ChatContainer
      chatId={chatId}
      initialMessages={initialMessages}
      title={chat.title}
    />
  );
}
