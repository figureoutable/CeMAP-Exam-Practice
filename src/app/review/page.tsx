"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GradientButton from "@/components/kokonutui/gradient-button";
import { LiquidButton } from "@/components/kokonutui/liquid-glass-card";
import { SessionProgress } from "@/components/kokonutui/kokonut-progress";
import { AnswerFeedback } from "@/components/AnswerFeedback";
import { OptionButton } from "@/components/OptionButton";
import { QuestionCard } from "@/components/QuestionCard";
import { PageHeader } from "@/components/PageHeader";
import { useQuestions } from "@/context/QuestionsContext";
import { addMistakeId, getMistakeIds, removeMistakeId } from "@/lib/storage";
import type { AnswerLetter } from "@/types/question";
import { shuffleArray, jumbledDisplayOptions } from "@/lib/quiz-utils";

export default function ReviewMistakesPage() {
  const router = useRouter();
  const { questions } = useQuestions();
  const [mistakeIds, setMistakeIds] = useState<number[]>([]);
  const [sessionIds, setSessionIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingSelection, setPendingSelection] = useState<AnswerLetter | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confirmedAnswer, setConfirmedAnswer] = useState<AnswerLetter | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [inSession, setInSession] = useState(false);

  const questionMap = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  useEffect(() => {
    setMistakeIds(getMistakeIds());
  }, []);

  const currentQuestion = inSession
    ? questionMap.get(sessionIds[currentIndex])
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
  }, [currentIndex, currentQuestion?.id]);

  const startReview = useCallback(() => {
    const ids = shuffleArray(mistakeIds);
    setSessionIds(ids);
    setCurrentIndex(0);
    setPendingSelection(null);
    setRevealed(false);
    setConfirmedAnswer(null);
    setScore(0);
    setAnswered(0);
    setInSession(true);
  }, [mistakeIds]);

  function confirmAnswer() {
    if (!currentQuestion || !pendingSelection || revealed) return;

    const isCorrect = pendingSelection === currentQuestion.correctAnswer;
    setConfirmedAnswer(pendingSelection);
    setRevealed(true);
    setAnswered((a) => a + 1);
    if (isCorrect) {
      setScore((s) => s + 1);
      removeMistakeId(currentQuestion.id);
      setMistakeIds((ids) => ids.filter((id) => id !== currentQuestion.id));
    } else {
      addMistakeId(currentQuestion.id);
    }
  }

  function goNext() {
    if (currentIndex >= sessionIds.length - 1) {
      setInSession(false);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setShuffleKey((k) => k + 1);
  }

  if (!mistakeIds.length && !inSession) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Review Mistakes"
          subtitle="Questions you have answered incorrectly will appear here."
          backHref="/"
        />
        <div className="rounded-2xl border border-blue-200 bg-white p-8 text-center">
          <p className="text-blue-700">No mistakes recorded yet. Keep practising!</p>
          <GradientButton
            label="Start Practice"
            variant="emerald"
            className="h-12"
            onClick={() => router.push("/practice")}
          />
        </div>
      </div>
    );
  }

  if (!inSession) {
    const mistakeQuestions = mistakeIds
      .map((id) => questionMap.get(id))
      .filter(Boolean);

    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Review Mistakes"
          subtitle={`${mistakeIds.length} question${mistakeIds.length === 1 ? "" : "s"} to revisit`}
          backHref="/"
        />

        <ul className="mb-6 max-h-80 space-y-2 overflow-y-auto">
          {mistakeQuestions.map((question) =>
            question ? (
              <li
                key={question.id}
                className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-blue-900"
              >
                <span className="font-medium text-blue-600">Q{question.id}</span>{" "}
                {question.question.slice(0, 100)}
                {question.question.length > 100 ? "…" : ""}
              </li>
            ) : null
          )}
        </ul>

        <GradientButton
          label="Retest Mistakes"
          variant="orange"
          className="h-14 w-full"
          onClick={startReview}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <PageHeader title="Review Complete" backHref="/" />
        <p className="mb-4 text-center text-blue-800">
          You scored {score} out of {answered} in this review.
        </p>
        <GradientButton
          label="Back to Home"
          variant="emerald"
          className="h-12 w-full"
          onClick={() => router.push("/")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Review Mistakes"
        subtitle={`Score: ${score} / ${answered}`}
        backHref="/"
      />

      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-blue-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <SessionProgress current={currentIndex + 1} total={sessionIds.length} />
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

      {revealed ? (
        <div className="mt-6">
          <LiquidButton className="h-12 w-full shadow-none" onClick={goNext}>
            {currentIndex >= sessionIds.length - 1 ? "Finish Review" : "Next Question"}
          </LiquidButton>
        </div>
      ) : (
        <div className="mt-6">
          <LiquidButton variant="outline" className="w-full" onClick={() => setInSession(false)}>
            Exit Review
          </LiquidButton>
        </div>
      )}
    </div>
  );
}
