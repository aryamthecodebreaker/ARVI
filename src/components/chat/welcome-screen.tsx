"use client";

import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const suggestions = [
  "Best wireless earbuds under \u20B92000",
  "Laptop for college students",
  "Birthday gift for my mom",
  "Compare water purifiers",
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
        <Bot className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        Hi! I&apos;m Arvi
      </h2>
      <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
        Your AI shopping assistant. Tell me what you&apos;re looking for, and
        I&apos;ll find the best products on Amazon.in for you.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {suggestions.map((text) => (
          <Button
            key={text}
            variant="outline"
            size="sm"
            className="rounded-full text-xs"
            onClick={() => onSuggestionClick(text)}
          >
            {text}
          </Button>
        ))}
      </div>
    </div>
  );
}
