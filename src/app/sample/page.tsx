"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LiquidButton } from "@/components/kokonutui/liquid-glass-card";
import { SessionProgress } from "@/components/kokonutui/kokonut-progress";
import { AnswerFeedback } from "@/components/AnswerFeedback";
import { OptionButton } from "@/components/OptionButton";
import { QuestionCard } from "@/components/QuestionCard";
import { useQuestions } from "@/context/QuestionsContext";
import { SAMPLE_QUESTION_COUNT, STORAGE_KEYS } from "@/lib/constants";
import { addMistakeId, getSessionItem, setSessionItem } from "@/lib/storage";
import {
  calculatePercentage,
  createSampleSession,
  jumbledDisplayOptions,
  type SampleSessionState,
} from "@/lib/quiz-utils";
import type { AnswerLetter } from "@/types/question";

export default function SamplePage() {
  const router = useRouter();
  const { questions } = useQuestions();
  const [session, setSession] = useState<SampleSessionState | null>(() => {
    if (typeof window === "undefined") return null;
    return getSessionItem<SampleSessionState>(STORAGE_KEYS.sampleSession);
  });
  const [pendingSelection, setPendingSelection] = useState<AnswerLetter | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const questionMap = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  const persistSession = useCallback((next: SampleSessionState) => {
    setSession(next);
    setSessionItem(STORAGE_KEYS.sampleSession, next);
  }, []);

  useEffect(() => {
    if (session) return;
    persistSession(createSampleSession(questions));
  }, [session, questions, persistSession]);

  const currentQuestion =
    session && session.phase === "active"
      ? questionMap.get(session.questionIds[session.currentIndex])
      : undefined;

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    return jumbledDisplayOptions(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, shuffleKey]);

  useEffect(() => {
    setPendingSelection(null);
  }, [session?.currentIndex, currentQuestion?.id]);

  function confirmAnswer() {
    if (!session || !currentQuestion || !pendingSelection) return;
    if (session.answers[currentQuestion.id] !== null) return;

    if (pendingSelection !== currentQuestion.correctAnswer) {
      addMistakeId(currentQuestion.id);
    }

    persistSession({
      ...session,
      answers: { ...session.answers, [currentQuestion.id]: pendingSelection },
    });
    setPendingSelection(null);
  }

  function goNext() {
    if (!session) return;

    if (session.currentIndex >= session.questionIds.length - 1) {
      persistSession({ ...session, phase: "complete" });
      return;
    }

    persistSession({ ...session, currentIndex: session.currentIndex + 1 });
    setShuffleKey((k) => k + 1);
  }

  if (!session || (!currentQuestion && session.phase === "active")) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-blue-700">Loading…</div>
    );
  }

  if (session.phase === "complete") {
    const score = session.questionIds.reduce((acc, id) => {
      const question = questionMap.get(id);
      return acc + (question && session.answers[id] === question.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = calculatePercentage(score, session.questionIds.length);

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-md border border-blue-200 bg-white p-8 text-center">
          <p className="text-sm text-blue-700">Sample complete</p>
          <p className="mt-2 text-4xl font-bold text-blue-950">
            {score}/{session.questionIds.length}
          </p>
          <p className="mt-1 text-xl text-blue-800">{percentage}%</p>
          <p className="mt-4 text-sm text-blue-700">
            Ready for the full exam? Choose adaptive or exam paper from the home screen.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <LiquidButton className="h-12 w-full shadow-none" onClick={() => router.push("/")}>
              Back to home
            </LiquidButton>
            <LiquidButton
              variant="outline"
              className="h-12 w-full shadow-none"
              onClick={() => {
                persistSession(createSampleSession(questions));
                setShuffleKey(0);
              }}
            >
              Try another 5
            </LiquidButton>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const userAnswer = session.answers[currentQuestion.id];
  const revealed = userAnswer !== null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-blue-900">
          Sample · Question {session.currentIndex + 1} of {SAMPLE_QUESTION_COUNT}
        </p>
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={() => router.push("/")}
        >
          Exit
        </button>
      </div>

      <SessionProgress
        current={session.currentIndex + 1}
        total={session.questionIds.length}
      />

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
        <div className="mt-4">
          <LiquidButton className="h-12 w-full shadow-none" onClick={confirmAnswer}>
            Confirm answer
          </LiquidButton>
        </div>
      ) : null}

      {revealed && userAnswer ? (
        <AnswerFeedback question={currentQuestion} userAnswer={userAnswer} />
      ) : null}

      {revealed ? (
        <div className="mt-4">
          <LiquidButton className="h-12 w-full shadow-none" onClick={goNext}>
            {session.currentIndex >= session.questionIds.length - 1 ? "See results" : "Next question"}
          </LiquidButton>
        </div>
      ) : null}
    </div>
  );
}
