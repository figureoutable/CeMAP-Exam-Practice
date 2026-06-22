"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LandingSampleQuestions } from "@/components/LandingSampleQuestions";
import { LandingWave } from "@/components/LandingWave";
import { PricingOptions, WhatsIncluded } from "@/components/PricingPlans";
import { useQuestions } from "@/context/QuestionsContext";
import { createAdaptiveSession } from "@/lib/adaptive-exam";
import {
  EXAM_PRACTICE_CASE_STUDY_COUNT,
  EXAM_PRACTICE_GENERAL_COUNT,
  EXAM_PRACTICE_QUESTIONS_PER_CASE,
  STORAGE_KEYS,
} from "@/lib/constants";
import { clearSessionItem, getMistakeIds, setSessionItem } from "@/lib/storage";
import { createExamPracticeSession } from "@/lib/quiz-utils";
import { cn } from "@/lib/utils";

type ExamType = "adaptive" | "exam-paper";

const modeCopy: Record<ExamType, { title: string; body: string; cta: string }> = {
  adaptive: {
    title: "Adaptive exam",
    body: "40 questions from random syllabus topics. Get one wrong and you drill that topic with extra questions until you are back on track.",
    cta: "Start adaptive exam",
  },
  "exam-paper": {
    title: "Exam paper",
    body: `A full 40-question sitting: ${EXAM_PRACTICE_GENERAL_COUNT} general questions plus ${EXAM_PRACTICE_CASE_STUDY_COUNT} case studies of ${EXAM_PRACTICE_QUESTIONS_PER_CASE} questions each.`,
    cta: "Start exam paper",
  },
};

export default function HomePage() {
  const router = useRouter();
  const { questions } = useQuestions();
  const [mistakeCount, setMistakeCount] = useState(0);
  const [examType, setExamType] = useState<ExamType>("adaptive");

  useEffect(() => {
    setMistakeCount(getMistakeIds().length);
  }, []);

  function startExamPractice() {
    clearSessionItem(STORAGE_KEYS.examPracticeSession);
    setSessionItem(STORAGE_KEYS.examPracticeSession, createExamPracticeSession(questions));
    router.push("/exam-practice");
  }

  function startAdaptivePractice() {
    clearSessionItem(STORAGE_KEYS.adaptiveExamSession);
    setSessionItem(STORAGE_KEYS.adaptiveExamSession, createAdaptiveSession());
    router.push("/adaptive");
  }

  function startFullExam() {
    if (examType === "adaptive") {
      startAdaptivePractice();
    } else {
      startExamPractice();
    }
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-stone-100 pb-14 pt-8 text-blue-950 md:pb-16 md:pt-10">
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-4 md:space-y-8 md:px-10 md:py-6">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-brand-blue sm:text-5xl md:text-6xl">
              CeMAP Practice Questions
            </h1>
            <p className="font-heading mt-3 text-2xl font-normal text-brand-blue sm:text-3xl md:text-4xl">
              Practice Smarter = Pass Faster
            </p>
          </div>

          <Image
            src="/hero-practice-modes-blue.jpg"
            alt="Two practice modes: sample exam and adaptive exam"
            width={1024}
            height={512}
            className="mx-auto h-auto w-[85%] max-w-[47.6rem]"
            priority
          />

        </div>

        <LandingWave className="absolute bottom-0 left-0 right-0" fill="#ffffff" />
      </section>

      <section className="bg-white px-6 pb-16 pt-4 md:pb-20 md:pt-6">
        <div className="mx-auto max-w-3xl md:px-4">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-normal text-blue-950 sm:text-4xl md:text-5xl">
              Choose your exam
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-blue-700">
              Pick adaptive or a full exam paper, then try the sample below.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:flex-wrap">
              <div className="inline-flex h-10 rounded-full border border-blue-200 bg-blue-50 p-1">
                {(["adaptive", "exam-paper"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExamType(type)}
                    className={cn(
                      "h-full rounded-full px-5 text-sm font-semibold transition-colors",
                      examType === type
                        ? "bg-blue-600 text-white"
                        : "text-blue-700 hover:text-blue-900"
                    )}
                  >
                    {type === "adaptive" ? "Adaptive" : "Exam paper"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={startFullExam}
                className="inline-flex h-10 items-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                {modeCopy[examType].cta}
              </button>
            </div>

            <h3 className="mt-6 text-lg font-semibold text-blue-950">
              {modeCopy[examType].title}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-base leading-relaxed text-blue-700">
              {modeCopy[examType].body}
            </p>
          </div>

          <div className="mt-12">
            <LandingSampleQuestions questions={questions} />
          </div>

          {mistakeCount > 0 ? (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push("/review")}
                className="text-sm font-medium text-blue-600 underline-offset-4 hover:text-blue-800 hover:underline"
              >
                Review mistakes ({mistakeCount})
              </button>
            </div>
          ) : null}

          <div className="mt-10">
            <WhatsIncluded />
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-3xl px-4 md:px-4">
          <PricingOptions />
        </div>
      </section>
    </div>
  );
}
