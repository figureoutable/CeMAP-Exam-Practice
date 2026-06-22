import type { ExamResult } from "@/types/question";
import { STORAGE_KEYS } from "@/lib/constants";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getExamResults(): ExamResult[] {
  if (typeof window === "undefined") return [];
  return safeParse<ExamResult[]>(
    localStorage.getItem(STORAGE_KEYS.examResults),
    []
  );
}

export function saveExamResult(result: ExamResult): void {
  const existing = getExamResults();
  localStorage.setItem(
    STORAGE_KEYS.examResults,
    JSON.stringify([result, ...existing].slice(0, 20))
  );
}

export function getMistakeIds(): number[] {
  if (typeof window === "undefined") return [];
  return safeParse<number[]>(
    localStorage.getItem(STORAGE_KEYS.mistakeIds),
    []
  );
}

export function addMistakeId(id: number): void {
  const existing = new Set(getMistakeIds());
  existing.add(id);
  localStorage.setItem(
    STORAGE_KEYS.mistakeIds,
    JSON.stringify([...existing].sort((a, b) => a - b))
  );
}

export function removeMistakeId(id: number): void {
  const next = getMistakeIds().filter((mistakeId) => mistakeId !== id);
  localStorage.setItem(STORAGE_KEYS.mistakeIds, JSON.stringify(next));
}

export function resetAllProgress(): void {
  localStorage.removeItem(STORAGE_KEYS.examResults);
  localStorage.removeItem(STORAGE_KEYS.mistakeIds);
  sessionStorage.removeItem(STORAGE_KEYS.practiceSession);
  sessionStorage.removeItem(STORAGE_KEYS.examSession);
  sessionStorage.removeItem(STORAGE_KEYS.adaptiveExamSession);
  sessionStorage.removeItem(STORAGE_KEYS.examPracticeSession);
  sessionStorage.removeItem(STORAGE_KEYS.sampleSession);
}

export function getSessionItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  return safeParse<T | null>(sessionStorage.getItem(key), null);
}

export function setSessionItem<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function clearSessionItem(key: string): void {
  sessionStorage.removeItem(key);
}
