import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const userId = searchParams.get("userId") || undefined;
  const limit = 20;

  const where = userId ? { userId } : undefined;

  const [chats, total] = await Promise.all([
    prisma.chat.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.chat.count({ where }),
  ]);

  return NextResponse.json({
    chats,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
