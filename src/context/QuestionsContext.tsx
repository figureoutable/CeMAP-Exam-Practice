"use client";

import { createContext, useContext, useMemo } from "react";
import questionsData from "@/data/questions.json";
import { TOPICS } from "@/lib/constants";
import type { Question } from "@/types/question";
import { getCategoryCounts } from "@/lib/quiz-utils";

interface QuestionsContextValue {
  questions: Question[];
  totalCount: number;
  categories: { name: string; count: number }[];
}

const QuestionsContext = createContext<QuestionsContextValue | null>(null);

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => {
    const questions = questionsData as Question[];
    const counts = getCategoryCounts(questions);
    const categories = TOPICS.map((topic) => ({
      name: topic.name,
      count: counts[topic.name] ?? 0,
    }));

    const extraCategories = Object.entries(counts)
      .filter(([name]) => !TOPICS.some((topic) => topic.name === name))
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      questions,
      totalCount: questions.length,
      categories: [...categories, ...extraCategories],
    };
  }, []);

  return (
    <QuestionsContext.Provider value={value}>{children}</QuestionsContext.Provider>
  );
}

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error("useQuestions must be used within QuestionsProvider");
  }
  return context;
}
