"use client";

import type { AnswerLetter } from "@/types/question";
import { cn } from "@/lib/utils";
import { IconCorrect, IconIncorrect } from "@/components/icons";

interface OptionButtonProps {
  letter: AnswerLetter;
  text: string;
  selected?: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function OptionButton({
  letter,
  text,
  selected = false,
  showResult = false,
  isCorrect = false,
  disabled = false,
  onSelect,
}: OptionButtonProps) {
  const showCorrect = showResult && isCorrect;
  const showIncorrect = showResult && selected && !isCorrect;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left transition-colors shadow-none",
        "disabled:cursor-default",
        !showResult && !selected && "border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50",
        !showResult && selected && "border-blue-600 bg-blue-50 ring-1 ring-blue-600",
        showCorrect && "border-blue-600 bg-blue-50",
        showIncorrect && "border-red-500 bg-red-50",
        showResult && !showCorrect && !showIncorrect && "border-blue-100 bg-white opacity-70"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-xs font-semibold",
          showCorrect && "bg-blue-600 text-white",
          showIncorrect && "bg-red-600 text-white",
          !showCorrect && !showIncorrect && selected && "bg-blue-600 text-white",
          !showCorrect && !showIncorrect && !selected && "bg-blue-100 text-blue-800"
        )}
      >
        {letter}
      </span>
      <span className="flex-1 text-sm leading-relaxed text-blue-950 sm:text-base">{text}</span>
      {showCorrect ? <IconCorrect className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> : null}
      {showIncorrect ? <IconIncorrect className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> : null}
    </button>
  );
}
