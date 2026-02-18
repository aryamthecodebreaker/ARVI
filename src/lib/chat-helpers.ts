import type { UserPreference } from "@prisma/client";
import type { MessageWithProducts } from "./types";
import { getGenAI, GEMINI_MODEL } from "./gemini";
import { prisma } from "./prisma";

export function buildGeminiContents(history: MessageWithProducts[]) {
  return history
    .filter((msg) => msg.role === "USER" || msg.role === "ASSISTANT")
    .map((msg) => {
      if (msg.role === "USER") {
        return { role: "user" as const, parts: [{ text: msg.content }] };
      }
      return { role: "model" as const, parts: [{ text: msg.content }] };
    });
}

export function formatPreferences(prefs: UserPreference | null): string {
  if (!prefs) return "No preference history yet — this appears to be a new user.";

  const parts: string[] = [];
  if (prefs.budgetMin || prefs.budgetMax) {
    parts.push(
      `Budget preference: ₹${prefs.budgetMin || 0} - ₹${prefs.budgetMax || "no limit"}`
    );
  }
  if (prefs.preferredBrands.length > 0) {
    parts.push(`Preferred brands: ${prefs.preferredBrands.join(", ")}`);
  }
  if (prefs.categories.length > 0) {
    parts.push(`Frequently shops for: ${prefs.categories.join(", ")}`);
  }
  if (prefs.pricePreference) {
    parts.push(`Price sensitivity: ${prefs.pricePreference}`);
  }
  if (prefs.preferredLanguage) {
    parts.push(`Preferred language: ${prefs.preferredLanguage}`);
  }
  if (prefs.rawPreferences) {
    parts.push(
      `Other known preferences: ${JSON.stringify(prefs.rawPreferences)}`
    );
  }

  return parts.length > 0
    ? `Known user preferences:\n${parts.join("\n")}`
    : "No strong preferences detected yet.";
}

export async function extractAndUpdatePreferences(
  userId: string,
  userMessage: string,
  assistantResponse: string
) {
  try {
    const response = await getGenAI().models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyze this shopping conversation and extract any user preferences.

User message: "${userMessage}"
Assistant response: "${assistantResponse}"

Return a JSON object with these fields (only include fields where you detected a preference):
{
  "budgetMin": number or null,
  "budgetMax": number or null,
  "brands": ["brand1", "brand2"] or [],
  "categories": ["category1"] or [],
  "pricePreference": "budget" | "mid-range" | "premium" | null,
  "language": "the language the user is writing in, e.g. English, Hindi, Tamil, Telugu, Marathi, Bengali, Hinglish, etc." or null,
  "otherPreferences": {} or {"key": "value"}
}

Return ONLY the JSON object, no markdown, no explanation.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const extracted = JSON.parse(text);

    if (
      !extracted.budgetMin &&
      !extracted.budgetMax &&
      (!extracted.brands || extracted.brands.length === 0) &&
      (!extracted.categories || extracted.categories.length === 0) &&
      !extracted.pricePreference &&
      !extracted.language
    ) {
      return;
    }

    const existing = await prisma.userPreference.findUnique({
      where: { userId },
    });

    await prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        budgetMin: extracted.budgetMin || null,
        budgetMax: extracted.budgetMax || null,
        preferredBrands: extracted.brands || [],
        categories: extracted.categories || [],
        pricePreference: extracted.pricePreference || null,
        preferredLanguage: extracted.language || null,
        rawPreferences: (extracted.otherPreferences || {}) as object,
      },
      update: {
        budgetMin: extracted.budgetMin || existing?.budgetMin,
        budgetMax: extracted.budgetMax || existing?.budgetMax,
        preferredBrands: mergeLists(
          existing?.preferredBrands || [],
          extracted.brands || []
        ),
        categories: mergeLists(
          existing?.categories || [],
          extracted.categories || []
        ),
        pricePreference: extracted.pricePreference || existing?.pricePreference,
        preferredLanguage: extracted.language || existing?.preferredLanguage,
        rawPreferences: mergeJson(
          existing?.rawPreferences,
          extracted.otherPreferences
        ) as object,
      },
    });
  } catch (error) {
    console.error("Failed to extract preferences:", error);
  }
}

function mergeLists(existing: string[], incoming: string[]): string[] {
  const set = new Set([...existing, ...incoming]);
  return Array.from(set).slice(0, 20);
}

function mergeJson(
  existing: unknown,
  incoming: unknown
): Record<string, unknown> {
  const existingObj =
    existing && typeof existing === "object" ? existing : {};
  const incomingObj =
    incoming && typeof incoming === "object" ? incoming : {};
  return { ...existingObj, ...incomingObj } as Record<string, unknown>;
}
