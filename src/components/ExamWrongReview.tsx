"use client";

import { KokonutBadge } from "@/components/kokonutui/kokonut-badge";
import type { AnswerLetter, Question } from "@/types/question";

interface ExamWrongReviewProps {
  wrongQuestions: Question[];
  answers: Record<number, AnswerLetter | null>;
}

export function ExamWrongReview({ wrongQuestions, answers }: ExamWrongReviewProps) {
  if (!wrongQuestions.length) {
    return (
      <div className="mb-6 rounded-md border border-blue-200 bg-white p-4 text-center text-sm text-blue-700">
        You answered every question correctly. Well done.
      </div>
    );
  }

  const grouped = wrongQuestions.reduce<Record<string, Question[]>>((acc, question) => {
    if (!acc[question.category]) acc[question.category] = [];
    acc[question.category].push(question);
    return acc;
  }, {});

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-sm font-medium text-blue-800">
        Questions to review ({wrongQuestions.length})
      </h2>
      <div className="space-y-5">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([category, categoryQuestions]) => (
            <div key={category}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-600">
                {category}
              </h3>
              <ul className="space-y-3">
                {categoryQuestions.map((question) => {
                  const userAnswer = answers[question.id];
                  return (
                    <li
                      key={question.id}
                      className="rounded-md border border-red-200 bg-white p-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-blue-950">
                          Q{question.id}. {question.question}
                        </p>
                        <KokonutBadge variant="incorrect">Incorrect</KokonutBadge>
                      </div>
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Your answer: </span>
                        <span className="text-red-700">
                          {userAnswer
                            ? `${userAnswer}. ${question.options[userAnswer]}`
                            : "Not answered"}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-blue-800">
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-blue-700">
                          {question.correctAnswer}. {question.options[question.correctAnswer]}
                        </span>
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-blue-800">
                        {question.explanation}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </div>
    </section>
  );
}
