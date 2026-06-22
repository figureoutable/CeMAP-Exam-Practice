"use client";

import type { AnswerLetter, Question } from "@/types/question";
import { KokonutBadge } from "@/components/kokonutui/kokonut-badge";
import { IconCorrect, IconIncorrect } from "@/components/icons";

interface AnswerFeedbackProps {
  question: Question;
  userAnswer: AnswerLetter;
}

export function AnswerFeedback({ question, userAnswer }: AnswerFeedbackProps) {
  const isCorrect = userAnswer === question.correctAnswer;

  return (
    <div
      className={
        isCorrect
          ? "mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-3"
          : "mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-3"
      }
    >
      <div className="mb-2 flex items-center gap-2">
        {isCorrect ? (
          <IconCorrect className="h-4 w-4 text-blue-600" />
        ) : (
          <IconIncorrect className="h-4 w-4 text-red-600" />
        )}
        <KokonutBadge variant={isCorrect ? "correct" : "incorrect"}>
          {isCorrect ? "Correct" : "Incorrect"}
        </KokonutBadge>
      </div>

      <p className="text-sm text-blue-900">
        <span className="font-medium">Your answer: </span>
        <span className={isCorrect ? "text-blue-800" : "text-red-800"}>
          {userAnswer}. {question.options[userAnswer]}
        </span>
      </p>

      {!isCorrect ? (
        <p className="mt-1.5 text-sm text-blue-900">
          <span className="font-medium">Correct answer: </span>
          <span className="text-blue-800">
            {question.correctAnswer}. {question.options[question.correctAnswer]}
          </span>
        </p>
      ) : null}

      <p className="mt-2 text-sm leading-relaxed text-blue-800">
        <span className="font-medium text-blue-900">Explanation: </span>
        {question.explanation}
      </p>
    </div>
  );
}
