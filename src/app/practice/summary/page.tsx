"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/kokonutui/gradient-button";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import { KokonutBadge } from "@/components/kokonutui/kokonut-badge";
import { PageHeader } from "@/components/PageHeader";
import { useQuestions } from "@/context/QuestionsContext";
import { buildCategoryStats, calculatePercentage } from "@/lib/quiz-utils";
import { STORAGE_KEYS } from "@/lib/constants";
import { clearSessionItem, getSessionItem } from "@/lib/storage";
import type { AnswerLetter } from "@/types/question";

interface PracticeSessionData {
  questionIds: number[];
  answers: Record<number, AnswerLetter>;
  currentIndex: number;
  score: number;
  skipped: number[];
  startedAt: number;
}

export default function PracticeSummaryPage() {
  const router = useRouter();
  const { questions } = useQuestions();
  const [session, setSession] = useState<PracticeSessionData | null>(null);

  const questionMap = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  useEffect(() => {
    const stored = getSessionItem<PracticeSessionData>(STORAGE_KEYS.practiceSession);
    if (!stored) return;
    setSession(stored);
    clearSessionItem(STORAGE_KEYS.practiceSession);
  }, []);

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-blue-700">No practice session to summarise.</p>
        <button
          type="button"
          className="mt-4 text-blue-700"
          onClick={() => router.push("/practice")}
        >
          Start a new session
        </button>
      </div>
    );
  }

  const sessionQuestions = session.questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean) as typeof questions;

  const answeredQuestions = sessionQuestions.filter((q) => session.answers[q.id]);
  const totalAnswered = answeredQuestions.length;
  const percentage = calculatePercentage(session.score, totalAnswered);
  const categoryStats = buildCategoryStats(answeredQuestions, session.answers);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Practice Summary"
        subtitle="Your session results and accuracy by category."
        backHref="/"
      />

      <LiquidGlassCard className="mb-6 rounded-2xl border border-blue-200/80 bg-white text-center">
        <p className="text-sm text-blue-700">Final score</p>
        <p className="mt-1 text-4xl font-semibold text-blue-950">
          {session.score}
          <span className="text-2xl text-blue-600"> / {totalAnswered}</span>
        </p>
        <KokonutBadge variant="default" className="mt-3">
          {percentage}% accuracy
        </KokonutBadge>
        {session.skipped.length > 0 ? (
          <p className="mt-3 text-sm text-blue-600">
            {session.skipped.length} question{session.skipped.length === 1 ? "" : "s"} skipped
          </p>
        ) : null}
      </LiquidGlassCard>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
          Accuracy by category
        </h2>
        <ul className="space-y-2">
          {categoryStats.map((stat) => {
            const pct = calculatePercentage(stat.correct, stat.total);
            return (
              <li
                key={stat.category}
                className="flex items-center justify-between rounded-xl border border-blue-200 bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-blue-900">{stat.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600">
                    {stat.correct}/{stat.total}
                  </span>
                  <KokonutBadge variant={pct >= 70 ? "correct" : "incorrect"}>
                    {pct}%
                  </KokonutBadge>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-col gap-2">
        <GradientButton
          label="Practice Again"
          variant="emerald"
          className="h-12 w-full"
          onClick={() => router.push("/practice")}
        />
        <GradientButton
          label="Back to Home"
          variant="purple"
          className="h-12 w-full"
          onClick={() => router.push("/")}
        />
      </div>
    </div>
  );
}
