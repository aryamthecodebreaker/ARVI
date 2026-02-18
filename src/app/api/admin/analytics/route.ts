import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalChats, totalMessages, totalProducts, recentChats] =
    await Promise.all([
      prisma.user.count(),
      prisma.chat.count(),
      prisma.message.count(),
      prisma.product.count(),
      prisma.chat.findMany({
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true, image: true } },
          _count: { select: { messages: true } },
        },
      }),
    ]);

  return NextResponse.json({
    totalUsers,
    totalChats,
    totalMessages,
    totalProducts,
    recentChats,
  });
}
