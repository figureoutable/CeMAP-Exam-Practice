"use client";

import { useEffect, useState } from "react";
import type { AnswerLetter, Question } from "@/types/question";
import { EXAM_QUESTION_COUNT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const QUESTIONS_PER_RANGE = EXAM_QUESTION_COUNT / 2;

interface ExamQuestionSidebarProps {
  questionIds: number[];
  currentIndex: number;
  answers: Record<number, AnswerLetter | null>;
  flagged: number[];
  questionMap: Map<number, Question>;
  onSelect: (index: number) => void;
  hideTitle?: boolean;
}

export function ExamQuestionSidebar({
  questionIds,
  currentIndex,
  answers,
  flagged,
  questionMap,
  onSelect,
  hideTitle = false,
}: ExamQuestionSidebarProps) {
  const [range, setRange] = useState<0 | 1>(currentIndex < QUESTIONS_PER_RANGE ? 0 : 1);

  useEffect(() => {
    setRange(currentIndex < QUESTIONS_PER_RANGE ? 0 : 1);
  }, [currentIndex]);

  const rangeStart = range * QUESTIONS_PER_RANGE;
  const visibleQuestions = questionIds.slice(rangeStart, rangeStart + QUESTIONS_PER_RANGE);

  return (
    <aside className={hideTitle ? "" : "w-full shrink-0 lg:w-36"}>
      {!hideTitle ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 lg:hidden">
          Questions
        </p>
      ) : null}

      <div className="mb-2 flex rounded-md border border-blue-200 bg-white p-0.5">
        <button
          type="button"
          onClick={() => setRange(0)}
          className={cn(
            "flex-1 rounded-sm py-1.5 text-xs font-medium transition-colors",
            range === 0 ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"
          )}
        >
          1–{QUESTIONS_PER_RANGE}
        </button>
        <button
          type="button"
          onClick={() => setRange(1)}
          className={cn(
            "flex-1 rounded-sm py-1.5 text-xs font-medium transition-colors",
            range === 1 ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50"
          )}
        >
          {QUESTIONS_PER_RANGE + 1}–{EXAM_QUESTION_COUNT}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-0.5">
        {visibleQuestions.map((id, offset) => {
          const index = rangeStart + offset;
          const answer = answers[id];
          const answered = answer !== null;
          const question = questionMap.get(id);
          const wasCorrect = answered && question && answer === question.correctAnswer;
          const isFlagged = flagged.includes(id);
          const isCurrent = index === currentIndex;

          let borderClass = "border-blue-200";
          if (isCurrent) borderClass = "border-blue-600";
          else if (answered && !wasCorrect) borderClass = "border-red-200";
          else if (!answered && isFlagged) borderClass = "border-blue-400";
          else if (answered && wasCorrect) borderClass = "border-transparent";

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "relative flex h-8 items-center justify-center rounded-sm border-2 text-xs font-medium transition-colors",
                borderClass,
                answered && wasCorrect && "bg-blue-100 text-blue-800",
                answered && !wasCorrect && "bg-red-50 text-red-700",
                !answered && "bg-white text-blue-700"
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
