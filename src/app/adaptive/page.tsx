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
  createAdaptiveSession,
  getAdaptiveSummary,
  getDrillTopic,
  getNextQuestion,
  isDrilling,
  parseAdaptiveSession,
  processAnswer,
  type AdaptiveExamSession,
} from "@/lib/adaptive-exam";
import { EXAM_QUESTION_COUNT, MAX_WRONG_PER_TOPIC, PASS_MARK_PERCENTAGE, STORAGE_KEYS } from "@/lib/constants";
import {
  addMistakeId,
  clearSessionItem,
  getSessionItem,
  removeMistakeId,
  saveExamResult,
  setSessionItem,
} from "@/lib/storage";
import { jumbledDisplayOptions } from "@/lib/quiz-utils";
import type { AnswerLetter, Question } from "@/types/question";

export default function AdaptiveExamPage() {
  const router = useRouter();
  const { questions } = useQuestions();
  const [session, setSession] = useState<AdaptiveExamSession | null>(() => {
    if (typeof window === "undefined") return null;
    return parseAdaptiveSession(getSessionItem(STORAGE_KEYS.adaptiveExamSession));
  });
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [pendingSelection, setPendingSelection] = useState<AnswerLetter | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confirmedAnswer, setConfirmedAnswer] = useState<AnswerLetter | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const resultSavedRef = useRef(false);

  const persistSession = useCallback((next: AdaptiveExamSession) => {
    setSession(next);
    setSessionItem(STORAGE_KEYS.adaptiveExamSession, next);
  }, []);

  useEffect(() => {
    if (session?.status === "complete") {
      setShowResults(true);
    }
  }, [session?.status]);

  useEffect(() => {
    if (!session) {
      const fresh = createAdaptiveSession();
      persistSession(fresh);
      return;
    }
    if (session.status === "active" && !activeQuestion) {
      setActiveQuestion(getNextQuestion(session, questions));
    }
  }, [session, questions, persistSession, activeQuestion]);

  useEffect(() => {
    if (session?.status !== "complete" || resultSavedRef.current) return;

    const summary = getAdaptiveSummary(session);
    resultSavedRef.current = true;
    saveExamResult({
      id: `${session.completedAt ?? Date.now()}`,
      date: new Date(session.completedAt ?? Date.now()).toISOString(),
      score: summary.correct,
      total: summary.total,
      percentage: summary.percentage,
      timeTakenSeconds: Math.round(
        ((session.completedAt ?? Date.now()) - session.startedAt) / 1000
      ),
      passed: summary.passed,
    });
  }, [session]);

  const options = useMemo(() => {
    if (!activeQuestion) return [];
    return jumbledDisplayOptions(activeQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion, shuffleKey]);

  useEffect(() => {
    setPendingSelection(null);
    setRevealed(false);
    setConfirmedAnswer(null);
  }, [activeQuestion?.id]);

  function confirmAnswer() {
    if (!session || !activeQuestion || !pendingSelection || revealed) return;

    const isCorrect = pendingSelection === activeQuestion.correctAnswer;
    const nextSession: AdaptiveExamSession = {
      ...session,
      usedIds: [...session.usedIds],
      score: { ...session.score },
      weakTopics: [...session.weakTopics],
    };
    processAnswer(nextSession, activeQuestion, pendingSelection);

    if (!isCorrect) {
      addMistakeId(activeQuestion.id);
    } else {
      removeMistakeId(activeQuestion.id);
    }

    setConfirmedAnswer(pendingSelection);
    setRevealed(true);
    persistSession(nextSession);
  }

  function continueSession() {
    if (!session) return;

    if (session.status === "complete") {
      setShowResults(true);
      return;
    }

    const nextQuestion = getNextQuestion(session, questions);
    setActiveQuestion(nextQuestion);
    setShuffleKey((k) => k + 1);
    persistSession(session);
  }

  function startNewExam() {
    resultSavedRef.current = false;
    setShowResults(false);
    setPendingSelection(null);
    setRevealed(false);
    setConfirmedAnswer(null);
    setShuffleKey(0);
    const fresh = createAdaptiveSession();
    persistSession(fresh);
    setActiveQuestion(getNextQuestion(fresh, questions));
  }

  function practiceWeakTopics() {
    if (!session?.weakTopics.length) return;
    const params = new URLSearchParams({ topics: session.weakTopics.join("|") });
    router.push(`/practice?${params.toString()}`);
  }

  if (!session || (!activeQuestion && session.status === "active")) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-blue-700">
        Loading…
      </div>
    );
  }

  if (session.status === "complete" && showResults) {
    const summary = getAdaptiveSummary(session);

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <PageHeader
          title="Adaptive Exam Complete"
          subtitle="Your personalised results across all syllabus topics."
          backHref="/"
        />

        <div className="mb-6 rounded-md border border-blue-200 bg-white p-6 text-center">
          <p className="text-sm text-blue-700">Overall score</p>
          <p className="mt-1 text-4xl font-semibold text-blue-950">
            {summary.correct}
            <span className="text-2xl text-blue-600"> / {summary.total}</span>
          </p>
          <p className="mt-2 text-2xl font-medium text-blue-900">{summary.percentage}%</p>
          <div className="mt-3 flex justify-center">
            <KokonutBadge variant={summary.passed ? "correct" : "incorrect"}>
              {summary.passed ? "Pass" : "Fail"} (pass mark {PASS_MARK_PERCENTAGE}%)
            </KokonutBadge>
          </div>
        </div>

        {summary.weakTopics.length > 0 ? (
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-medium text-blue-800">Topics to revisit</h2>
            <ul className="space-y-2">
              {summary.weakTopics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-blue-950">{topic}</span>
                  <KokonutBadge variant="incorrect">Needs practice</KokonutBadge>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="mb-6 rounded-md border border-blue-200 bg-white p-4 text-center text-sm text-blue-700">
            Strong performance across all topics. No weak areas flagged.
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {summary.weakTopics.length > 0 ? (
            <LiquidButton className="h-12 w-full shadow-none" onClick={practiceWeakTopics}>
              Practice weak topics
            </LiquidButton>
          ) : null}
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

  if (!activeQuestion) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-blue-700">
        No questions available for this topic.
      </div>
    );
  }

  const drilling = isDrilling(session);
  const drillTopic = getDrillTopic(session);
  const questionNumber = session.score.total + (revealed ? 0 : 1);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-900">
            Question {Math.min(questionNumber, EXAM_QUESTION_COUNT)} of {EXAM_QUESTION_COUNT}
          </p>
          <p className="text-sm text-blue-700">
            Score {session.score.correct}/{session.score.total}
          </p>
        </div>
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={() => router.push("/")}
        >
          Exit
        </button>
      </div>

      <div className="mb-4 space-y-2 rounded-md border border-blue-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-blue-900">{activeQuestion.category}</p>
          <KokonutBadge variant={drilling ? "incorrect" : "default"}>
            {drilling
              ? `Drilling ${drillTopic ?? activeQuestion.category} (${session.wrongCount}/${MAX_WRONG_PER_TOPIC})`
              : "Random topic"}
          </KokonutBadge>
        </div>
        {drilling ? (
          <p className="text-sm text-blue-700">
            Extra practice on this topic until you answer correctly or reach the drill limit.
          </p>
        ) : (
          <p className="text-sm text-blue-700">
            Questions are drawn from across the syllabus until you stumble on a topic.
          </p>
        )}
      </div>

      <QuestionCard category={activeQuestion.category} question={activeQuestion.question}>
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
            isCorrect={option.originalLetter === activeQuestion.correctAnswer}
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
        <AnswerFeedback question={activeQuestion} userAnswer={confirmedAnswer} />
      ) : null}

      {revealed ? (
        <div className="mt-4">
          <LiquidButton className="h-12 w-full shadow-none" onClick={continueSession}>
            Continue
          </LiquidButton>
        </div>
      ) : null}
    </div>
  );
}
