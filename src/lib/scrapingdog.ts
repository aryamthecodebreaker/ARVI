import type { MappedProduct } from "./types";

interface ScrapingdogProduct {
  type: string;
  position: number;
  title: string;
  image: string;
  has_prime: boolean;
  is_best_seller: boolean;
  is_amazon_choice: boolean;
  stars: number | null;
  total_reviews: string | null;
  url: string;
  availability_quantity: string | null;
  price_string: string | null;
  price_symbol: string | null;
  price: number | null;
}

const searchCache = new Map<
  string,
  { data: MappedProduct[]; timestamp: number }
>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function searchAmazon(
  query: string,
  maxResults: number = 5
): Promise<MappedProduct[]> {
  const cacheKey = `${query.toLowerCase().trim()}-${maxResults}`;

  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const params = new URLSearchParams({
    api_key: process.env.SCRAPINGDOG_API_KEY!,
    domain: "in",
    query: query,
    page: "1",
  });

  const response = await fetch(
    `https://api.scrapingdog.com/amazon/search?${params.toString()}`
  );

  if (!response.ok) {
    console.error(
      "Scrapingdog API error:",
      response.status,
      await response.text()
    );
    throw new Error("Failed to search Amazon products");
  }

  const data = await response.json();

  const rawProducts: ScrapingdogProduct[] = Array.isArray(data)
    ? data[0] || []
    : data.results || [];

  const mapped: MappedProduct[] = rawProducts
    .filter(
      (p) => p.title && p.title.trim() !== "" && p.price !== null && p.price > 0
    )
    .slice(0, maxResults)
    .map((p) => ({
      asin: extractAsin(p.url),
      title: p.title,
      price: p.price,
      priceString: p.price_string || `₹${p.price}`,
      image: p.image || null,
      url: p.url.startsWith("http") ? p.url : `https://www.amazon.in${p.url}`,
      rating: p.stars,
      reviewCount: p.total_reviews
        ? parseInt(p.total_reviews.replace(/,/g, ""), 10)
        : null,
      isPrime: p.has_prime || false,
      summary: null,
    }))
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  searchCache.set(cacheKey, { data: mapped, timestamp: Date.now() });

  return mapped;
}

function extractAsin(url: string): string {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/);
  return match ? match[1] : `product-${Date.now()}`;
}

export function summarizeForGemini(
  product: MappedProduct
): Record<string, unknown> {
  return {
    title: product.title,
    price: product.priceString,
    rating: product.rating ? `${product.rating}/5 stars` : "No rating",
    reviewCount: product.reviewCount || 0,
    isPrime: product.isPrime,
  };
}
