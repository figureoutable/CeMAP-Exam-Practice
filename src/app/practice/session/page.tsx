"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LiquidButton } from "@/components/kokonutui/liquid-glass-card";
import { SessionProgress } from "@/components/kokonutui/kokonut-progress";
import { AnswerFeedback } from "@/components/AnswerFeedback";
import { OptionButton } from "@/components/OptionButton";
import { QuestionCard } from "@/components/QuestionCard";
import { PageHeader } from "@/components/PageHeader";
import { useQuestions } from "@/context/QuestionsContext";
import { STORAGE_KEYS } from "@/lib/constants";
import { addMistakeId, getSessionItem, setSessionItem } from "@/lib/storage";
import type { AnswerLetter } from "@/types/question";
import { jumbledDisplayOptions } from "@/lib/quiz-utils";

interface PracticeSession {
  questionIds: number[];
  answers: Record<number, AnswerLetter>;
  currentIndex: number;
  score: number;
  skipped: number[];
  startedAt: number;
}

export default function PracticeSessionPage() {
  const router = useRouter();
  const { questions } = useQuestions();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [pendingSelection, setPendingSelection] = useState<AnswerLetter | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confirmedAnswer, setConfirmedAnswer] = useState<AnswerLetter | null>(null);

  const questionMap = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  useEffect(() => {
    const stored = getSessionItem<PracticeSession>(STORAGE_KEYS.practiceSession);
    if (!stored || !stored.questionIds.length) {
      router.replace("/practice");
      return;
    }
    setSession(stored);
  }, [router]);

  const currentQuestion = session
    ? questionMap.get(session.questionIds[session.currentIndex])
    : undefined;

  const [shuffleKey, setShuffleKey] = useState(0);

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    return jumbledDisplayOptions(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, shuffleKey]);

  useEffect(() => {
    setPendingSelection(null);
    setRevealed(false);
    setConfirmedAnswer(null);
  }, [session?.currentIndex, currentQuestion?.id]);

  const updateSession = useCallback((next: PracticeSession) => {
    setSession(next);
    setSessionItem(STORAGE_KEYS.practiceSession, next);
  }, []);

  function confirmAnswer() {
    if (!session || !currentQuestion || !pendingSelection || revealed) return;

    const isCorrect = pendingSelection === currentQuestion.correctAnswer;
    setConfirmedAnswer(pendingSelection);
    setRevealed(true);

    if (!isCorrect) {
      addMistakeId(currentQuestion.id);
    }

    updateSession({
      ...session,
      answers: { ...session.answers, [currentQuestion.id]: pendingSelection },
      score: session.score + (isCorrect ? 1 : 0),
    });
  }

  function goNext() {
    if (!session) return;

    if (session.currentIndex >= session.questionIds.length - 1) {
      router.push("/practice/summary");
      return;
    }

    updateSession({ ...session, currentIndex: session.currentIndex + 1 });
    setShuffleKey((k) => k + 1);
  }

  function handleSkip() {
    if (!session || !currentQuestion) return;

    const skipped = session.skipped.includes(currentQuestion.id)
      ? session.skipped
      : [...session.skipped, currentQuestion.id];

    if (session.currentIndex >= session.questionIds.length - 1) {
      updateSession({ ...session, skipped });
      router.push("/practice/summary");
      return;
    }

    updateSession({
      ...session,
      skipped,
      currentIndex: session.currentIndex + 1,
    });
    setShuffleKey((k) => k + 1);
  }

  function endEarly() {
    router.push("/practice/summary");
  }

  if (!session || !currentQuestion) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-blue-700">
        Loading session…
      </div>
    );
  }

  const answeredCount = Object.keys(session.answers).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Standard Practice"
        subtitle={`Score: ${session.score} / ${answeredCount} answered`}
        backHref="/practice"
        backLabel="Change topic"
      />

      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-blue-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <SessionProgress
          current={session.currentIndex + 1}
          total={session.questionIds.length}
        />
      </div>

      <QuestionCard category={currentQuestion.category} question={currentQuestion.question}>
        {options.map((option) => (
          <OptionButton
            key={option.displayLetter}
            letter={option.displayLetter}
            text={option.text}
            selected={
              revealed
                ? confirmedAnswer === option.originalLetter
                : pendingSelection === option.originalLetter
            }
            showResult={revealed}
            isCorrect={option.originalLetter === currentQuestion.correctAnswer}
            disabled={revealed}
            onSelect={() => setPendingSelection(option.originalLetter)}
          />
        ))}
      </QuestionCard>

      {!revealed && pendingSelection ? (
        <div className="mt-4">
          <LiquidButton className="h-12 w-full shadow-none" onClick={confirmAnswer}>
            Confirm answer
          </LiquidButton>
        </div>
      ) : null}

      {revealed && confirmedAnswer ? (
        <AnswerFeedback question={currentQuestion} userAnswer={confirmedAnswer} />
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {revealed ? (
          <LiquidButton className="h-12 w-full shadow-none sm:col-span-3" onClick={goNext}>
            {session.currentIndex >= session.questionIds.length - 1
              ? "View Summary"
              : "Next Question"}
          </LiquidButton>
        ) : (
          <>
            <LiquidButton variant="outline" className="h-12 w-full shadow-none" onClick={handleSkip}>
              Skip
            </LiquidButton>
            <LiquidButton
              variant="outline"
              className="h-12 w-full border-red-200 text-red-700 shadow-none sm:col-span-2"
              onClick={endEarly}
            >
              End Session
            </LiquidButton>
          </>
        )}
      </div>
    </div>
  );
}
