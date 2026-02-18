"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import type { MappedProduct } from "@/lib/types";

interface ProductCarouselProps {
  products: MappedProduct[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = [...products].sort(
    (a, b) => (a.price || 0) - (b.price || 0)
  );

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="group relative">
      {/* Scroll buttons - desktop only */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-white shadow-md group-hover:md:flex"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-white shadow-md group-hover:md:flex"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sorted.map((product) => (
          <ProductCard key={product.asin} product={product} />
        ))}
      </div>
    </div>
  );
}
