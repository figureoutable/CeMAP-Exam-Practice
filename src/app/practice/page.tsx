"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GradientButton from "@/components/kokonutui/gradient-button";
import { LiquidButton } from "@/components/kokonutui/liquid-glass-card";
import { PageHeader } from "@/components/PageHeader";
import { useQuestions } from "@/context/QuestionsContext";
import { filterByCategories, shuffleArray } from "@/lib/quiz-utils";
import { STORAGE_KEYS } from "@/lib/constants";
import { setSessionItem } from "@/lib/storage";
import { cn } from "@/lib/utils";

function PracticeSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { questions, categories } = useQuestions();
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = selected.length === 0;

  useEffect(() => {
    const topics = searchParams.get("topics");
    if (topics) {
      setSelected(topics.split("|").filter(Boolean));
    }
  }, [searchParams]);

  function toggleCategory(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function startPractice() {
    const filtered = filterByCategories(questions, selected);
    const sessionQuestions = shuffleArray(filtered);

    setSessionItem(STORAGE_KEYS.practiceSession, {
      questionIds: sessionQuestions.map((q) => q.id),
      answers: {},
      currentIndex: 0,
      score: 0,
      skipped: [],
      startedAt: Date.now(),
    });

    router.push("/practice/session");
  }

  const previewCount = allSelected
    ? questions.length
    : filterByCategories(questions, selected).length;

  return (
    <>
      <div className="mb-4">
        <LiquidButton
          variant={allSelected ? "default" : "outline"}
          className={cn(
            "mb-3 w-full justify-start",
            allSelected && "border-blue-600 bg-blue-50 text-blue-800"
          )}
          onClick={() => setSelected([])}
        >
          All categories ({questions.length})
        </LiquidButton>

        <div className="space-y-2">
          {categories.map((category) => {
            const isSelected = selected.includes(category.name);
            return (
              <LiquidButton
                key={category.name}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "w-full justify-between",
                  isSelected && "border-blue-600 bg-blue-50 text-blue-800"
                )}
                onClick={() => toggleCategory(category.name)}
              >
                <span>{category.name}</span>
                <span className="text-sm opacity-70">{category.count}</span>
              </LiquidButton>
            );
          })}
        </div>
      </div>

      <p className="mb-4 text-center text-sm text-blue-700">
        {previewCount} question{previewCount === 1 ? "" : "s"} in this session
      </p>

      <GradientButton
        label="Start Practice"
        variant="emerald"
        className="h-14 w-full"
        disabled={previewCount === 0}
        onClick={startPractice}
      />
    </>
  );
}

export default function PracticeSetupPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Practice Mode"
        subtitle="Select a subject area and work through questions at your own pace."
        backHref="/"
      />

      <Suspense
        fallback={
          <p className="text-center text-sm text-blue-700">Loading topics…</p>
        }
      >
        <PracticeSetupContent />
      </Suspense>
    </div>
  );
}
