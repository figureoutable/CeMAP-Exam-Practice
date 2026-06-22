"use client";

import { useMemo, useState } from "react";
import { KokonutBadge } from "@/components/kokonutui/kokonut-badge";
import { AnswerFeedback } from "@/components/AnswerFeedback";
import { OptionButton } from "@/components/OptionButton";
import { QuestionCard } from "@/components/QuestionCard";
import { SAMPLE_QUESTION_COUNT } from "@/lib/constants";
import { addMistakeId } from "@/lib/storage";
import {
  calculatePercentage,
  createSampleSession,
  jumbledDisplayOptions,
  type SampleSessionState,
} from "@/lib/quiz-utils";
import type { AnswerLetter, Question } from "@/types/question";

interface LandingSampleQuestionsProps {
  questions: Question[];
}

export function LandingSampleQuestions({ questions }: LandingSampleQuestionsProps) {
  const [session, setSession] = useState<SampleSessionState>(() =>
    createSampleSession(questions)
  );
  const [pendingSelection, setPendingSelection] = useState<AnswerLetter | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const questionMap = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  const currentQuestion =
    session.phase === "active"
      ? questionMap.get(session.questionIds[session.currentIndex])
      : undefined;

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    return jumbledDisplayOptions(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, shuffleKey]);

  function restartSample() {
    setSession(createSampleSession(questions));
    setPendingSelection(null);
    setShuffleKey((k) => k + 1);
  }

  function confirmAnswer() {
    if (!currentQuestion || !pendingSelection) return;
    if (session.answers[currentQuestion.id] !== null) return;

    if (pendingSelection !== currentQuestion.correctAnswer) {
      addMistakeId(currentQuestion.id);
    }

    setSession({
      ...session,
      answers: { ...session.answers, [currentQuestion.id]: pendingSelection },
    });
    setPendingSelection(null);
  }

  function goNext() {
    if (session.currentIndex >= session.questionIds.length - 1) {
      setSession({ ...session, phase: "complete" });
      return;
    }

    setSession({ ...session, currentIndex: session.currentIndex + 1 });
    setPendingSelection(null);
    setShuffleKey((k) => k + 1);
  }

  if (session.phase === "complete") {
    const score = session.questionIds.reduce((acc, id) => {
      const question = questionMap.get(id);
      return acc + (question && session.answers[id] === question.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = calculatePercentage(score, session.questionIds.length);

    return (
      <div className="rounded-md border border-blue-200 bg-white p-6 text-center">
        <p className="text-sm text-blue-700">Sample complete</p>
        <p className="mt-2 text-3xl font-bold text-blue-950">
          {score}/{session.questionIds.length}
        </p>
        <p className="mt-1 text-lg text-blue-800">{percentage}%</p>
        <button
          type="button"
          onClick={restartSample}
          className="mt-5 w-full rounded-full border-2 border-blue-200 bg-white py-3 text-sm font-bold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          Try another 5
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const userAnswer = session.answers[currentQuestion.id];
  const revealed = userAnswer !== null;

  return (
    <div className="rounded-md border border-blue-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-blue-900">
          Sample · Question {session.currentIndex + 1} of {SAMPLE_QUESTION_COUNT}
        </p>
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={restartSample}
        >
          Restart
        </button>
      </div>

      {currentQuestion.scenario ? (
        <div className="mt-4 rounded-md border border-blue-300 bg-blue-50 p-4">
          {currentQuestion.caseStudyTitle ? (
            <div className="mb-2">
              <KokonutBadge variant="outline">{currentQuestion.caseStudyTitle}</KokonutBadge>
            </div>
          ) : null}
          <p className="whitespace-pre-line text-sm leading-relaxed text-blue-800">
            {currentQuestion.scenario}
          </p>
        </div>
      ) : null}

      <div className="mt-4">
        <QuestionCard category={currentQuestion.category} question={currentQuestion.question}>
          {options.map((option) => (
            <OptionButton
              key={option.displayLetter}
              letter={option.displayLetter}
              text={option.text}
              selected={
                revealed
                  ? userAnswer === option.originalLetter
                  : pendingSelection === option.originalLetter
              }
              showResult={revealed}
              isCorrect={option.originalLetter === currentQuestion.correctAnswer}
              disabled={revealed}
              onSelect={() => setPendingSelection(option.originalLetter)}
            />
          ))}
        </QuestionCard>
      </div>

      {!revealed && pendingSelection ? (
        <button
          type="button"
          onClick={confirmAnswer}
          className="mt-4 w-full rounded-full bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          Confirm answer
        </button>
      ) : null}

      {revealed && userAnswer ? (
        <AnswerFeedback question={currentQuestion} userAnswer={userAnswer} />
      ) : null}

      {revealed ? (
        <button
          type="button"
          onClick={goNext}
          className="mt-4 w-full rounded-full border-2 border-blue-200 bg-white py-3 text-sm font-bold text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-50"
        >
          {session.currentIndex >= session.questionIds.length - 1
            ? "See results"
            : "Next question"}
        </button>
      ) : null}
    </div>
  );
}
