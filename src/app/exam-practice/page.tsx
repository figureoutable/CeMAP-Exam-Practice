"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LiquidButton } from "@/components/kokonutui/liquid-glass-card";
import { KokonutBadge } from "@/components/kokonutui/kokonut-badge";
import { AnswerFeedback } from "@/components/AnswerFeedback";
import { OptionButton } from "@/components/OptionButton";
import { QuestionCard } from "@/components/QuestionCard";
import { PageHeader } from "@/components/PageHeader";
import { useQuestions } from "@/context/QuestionsContext";
import {
  EXAM_PRACTICE_QUESTIONS_PER_CASE,
  PASS_MARK_PERCENTAGE,
  STORAGE_KEYS,
} from "@/lib/constants";
import {
  addMistakeId,
  getSessionItem,
  removeMistakeId,
  saveExamResult,
  setSessionItem,
} from "@/lib/storage";
import {
  calculatePercentage,
  createExamPracticeSession,
  getExamPracticeSegmentForIndex,
  jumbledDisplayOptions,
  type ExamPracticeSessionState,
} from "@/lib/quiz-utils";
import type { AnswerLetter } from "@/types/question";

export default function ExamPracticePage() {
  const router = useRouter();
  const { questions } = useQuestions();
  const [session, setSession] = useState<ExamPracticeSessionState | null>(() => {
    if (typeof window === "undefined") return null;
    return getSessionItem<ExamPracticeSessionState>(STORAGE_KEYS.examPracticeSession);
  });
  const [pendingSelection, setPendingSelection] = useState<AnswerLetter | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);
  const submittedRef = useRef(false);

  const questionMap = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  const persistSession = useCallback((next: ExamPracticeSessionState) => {
    setSession(next);
    setSessionItem(STORAGE_KEYS.examPracticeSession, next);
  }, []);

  useEffect(() => {
    if (session) return;
    persistSession(createExamPracticeSession(questions));
  }, [session, questions, persistSession]);

  const currentQuestion =
    session && session.phase === "active"
      ? questionMap.get(session.questionIds[session.currentIndex])
      : undefined;

  const segmentInfo =
    session && session.phase === "active"
      ? getExamPracticeSegmentForIndex(session.segments, session.currentIndex)
      : undefined;

  const currentSegment = segmentInfo?.segment;
  const segmentQuestionIndex = segmentInfo?.indexInSegment ?? 0;

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

    const isCorrect = pendingSelection === currentQuestion.correctAnswer;
    if (!isCorrect) {
      addMistakeId(currentQuestion.id);
    } else {
      removeMistakeId(currentQuestion.id);
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
      submitExam(session);
      return;
    }

    persistSession({ ...session, currentIndex: session.currentIndex + 1 });
    setShuffleKey((k) => k + 1);
  }

  function goPrevious() {
    if (!session || session.currentIndex === 0) return;
    persistSession({ ...session, currentIndex: session.currentIndex - 1 });
    setShuffleKey((k) => k + 1);
  }

  function submitExam(current: ExamPracticeSessionState) {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const submittedAt = Date.now();
    let score = 0;
    for (const id of current.questionIds) {
      const question = questionMap.get(id);
      if (question && current.answers[id] === question.correctAnswer) {
        score += 1;
      }
    }

    const percentage = calculatePercentage(score, current.questionIds.length);
    saveExamResult({
      id: `${submittedAt}`,
      date: new Date(submittedAt).toISOString(),
      score,
      total: current.questionIds.length,
      percentage,
      timeTakenSeconds: Math.round((submittedAt - current.startedAt) / 1000),
      passed: percentage >= PASS_MARK_PERCENTAGE,
    });

    persistSession({
      ...current,
      phase: "results",
      submittedAt,
    });
  }

  function startNewExam() {
    submittedRef.current = false;
    persistSession(createExamPracticeSession(questions));
    setShuffleKey(0);
  }

  if (!session || (!currentQuestion && session.phase === "active")) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-blue-700">
        Loading…
      </div>
    );
  }

  if (session.phase === "results") {
    const score = session.questionIds.reduce((acc, id) => {
      const question = questionMap.get(id);
      return acc + (question && session.answers[id] === question.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = calculatePercentage(score, session.questionIds.length);
    const passed = percentage >= PASS_MARK_PERCENTAGE;

    const wrongQuestions = session.questionIds
      .map((id) => questionMap.get(id))
      .filter((q) => q && session.answers[q.id] !== q.correctAnswer);

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <PageHeader title="Exam Results" subtitle="Your score for this sitting." backHref="/" />

        <div className="mb-6 rounded-md border border-blue-200 bg-white p-6 text-center">
          <p className="text-sm text-blue-700">Score</p>
          <p className="mt-1 text-4xl font-semibold text-blue-950">
            {score}
            <span className="text-2xl text-blue-600"> / {session.questionIds.length}</span>
          </p>
          <p className="mt-2 text-2xl font-medium text-blue-900">{percentage}%</p>
          <div className="mt-3 flex justify-center">
            <KokonutBadge variant={passed ? "correct" : "incorrect"}>
              {passed ? "Pass" : "Fail"} (pass mark {PASS_MARK_PERCENTAGE}%)
            </KokonutBadge>
          </div>
        </div>

        {wrongQuestions.length > 0 ? (
          <p className="mb-6 text-center text-sm text-blue-700">
            {wrongQuestions.length} question{wrongQuestions.length === 1 ? "" : "s"} to review. Use
            Review Mistakes from the home screen.
          </p>
        ) : (
          <p className="mb-6 text-center text-sm text-blue-700">
            Full marks. Well done.
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <LiquidButton className="h-12 w-full shadow-none" onClick={startNewExam}>
            Take Another Exam
          </LiquidButton>
          <LiquidButton
            variant="outline"
            className="h-12 w-full shadow-none"
            onClick={() => router.push("/")}
          >
            Back to Home
          </LiquidButton>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const userAnswer = session.answers[currentQuestion.id];
  const revealed = userAnswer !== null;
  const answeredCount = session.questionIds.filter((id) => session.answers[id] !== null).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-900">
            Question {session.currentIndex + 1} of {session.questionIds.length}
          </p>
          <p className="text-sm text-blue-700">{answeredCount} answered</p>
        </div>
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={() => router.push("/")}
        >
          Exit
        </button>
      </div>

      {currentSegment?.type === "case-study" && currentSegment.scenario ? (
        <div className="mb-4 rounded-md border border-blue-300 bg-blue-50 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-blue-950">
              Case study: {currentSegment.caseStudyTitle}
            </p>
            <KokonutBadge variant="outline">
              Question {segmentQuestionIndex + 1} of {EXAM_PRACTICE_QUESTIONS_PER_CASE}
            </KokonutBadge>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-blue-800">
            {currentSegment.scenario}
          </p>
        </div>
      ) : null}

      <QuestionCard
        category={currentQuestion.category}
        question={currentQuestion.question}
        showCategory={false}
      >
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

      {revealed && userAnswer ? (
        <AnswerFeedback question={currentQuestion} userAnswer={userAnswer} />
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <LiquidButton
          className="h-12 w-full shadow-none"
          disabled={!pendingSelection || revealed}
          onClick={confirmAnswer}
        >
          Confirm answer
        </LiquidButton>
        <LiquidButton
          variant="outline"
          className="h-12 w-full shadow-none"
          disabled={session.currentIndex === 0}
          onClick={goPrevious}
        >
          Previous
        </LiquidButton>
        <LiquidButton
          variant="outline"
          className="h-12 w-full shadow-none"
          disabled={!revealed}
          onClick={goNext}
        >
          {session.currentIndex >= session.questionIds.length - 1 ? "Submit exam" : "Next"}
        </LiquidButton>
      </div>
    </div>
  );
}
