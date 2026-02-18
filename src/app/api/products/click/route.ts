import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/products/click - Track a product click
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { asin } = await request.json();

  if (!asin) {
    return NextResponse.json({ error: "ASIN required" }, { status: 400 });
  }

  // Find the product by ASIN
  const product = await prisma.product.findFirst({
    where: { asin },
    orderBy: { createdAt: "desc" },
  });

  if (product) {
    await prisma.productClick.create({
      data: {
        userId: session.user.id,
        productId: product.id,
      },
    });
  }

  return NextResponse.json({ success: true });
}
