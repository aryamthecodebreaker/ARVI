import { GoogleGenAI, Type } from "@google/genai";

let _genai: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!_genai) {
    _genai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }
  return _genai;
}

export const GEMINI_MODEL = "gemini-2.0-flash";

export const searchAmazonFunctionDeclaration = {
  name: "search_amazon",
  description:
    "Search for products on Amazon India (Amazon.in). Use this tool when the user wants product recommendations or is looking for something to buy. Returns product listings with titles, prices, images, ratings, and links.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description:
          "The search query for Amazon.in. Be specific and include relevant keywords like brand names, product types, and key features. Example: 'Sony wireless earbuds noise cancelling under 5000'",
      },
      maxResults: {
        type: Type.NUMBER,
        description:
          "Maximum number of products to return. Default is 5, minimum 3, maximum 10.",
      },
    },
    required: ["query"],
  },
};
