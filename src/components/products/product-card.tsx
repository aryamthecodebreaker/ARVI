"use client";

import { Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MappedProduct } from "@/lib/types";

interface ProductCardProps {
  product: MappedProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const handleClick = async () => {
    // Track the click
    try {
      await fetch("/api/products/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asin: product.asin }),
      });
    } catch {
      // Non-critical
    }
    window.open(product.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Product Image */}
      <div className="relative flex h-[180px] items-center justify-center bg-gray-50 p-3">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="text-sm text-gray-400">No image</div>
        )}
        {product.isPrime && (
          <Badge className="absolute top-2 right-2 bg-blue-600 text-[10px]">
            Prime
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-gray-900">
          {product.title}
        </h3>

        {product.summary && (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
            {product.summary}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(product.rating!)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-[10px] text-gray-400">
                ({product.reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <p className="mt-auto text-lg font-bold text-gray-900">
          {product.priceString || (product.price ? `₹${product.price.toLocaleString()}` : "N/A")}
        </p>

        {/* Amazon Link */}
        <Button
          onClick={handleClick}
          size="sm"
          className="mt-1 w-full gap-1.5 bg-amber-500 text-xs font-medium hover:bg-amber-600"
        >
          View on Amazon
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
