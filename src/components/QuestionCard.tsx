"use client";

import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { KokonutBadge } from "@/components/kokonutui/kokonut-badge";

interface QuestionCardProps {
  category: string;
  question: string;
  children: React.ReactNode;
}

export function QuestionCard({ category, question, children }: QuestionCardProps) {
  return (
    <LiquidGlassCard
      glassSize="lg"
      className="rounded-md border border-blue-200 bg-white"
    >
      <div className="space-y-3">
        <KokonutBadge variant="category">{category}</KokonutBadge>
        <p className="text-base font-medium leading-relaxed text-blue-950 sm:text-lg">
          {question}
        </p>
        <div className="space-y-2">{children}</div>
      </div>
    </LiquidGlassCard>
  );
}
