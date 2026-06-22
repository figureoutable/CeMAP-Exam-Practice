import type { AnswerLetter, CategoryStats, DisplayOption, Question, ShuffledOption } from "@/types/question";
import {
  EXAM_PRACTICE_CASE_STUDY_COUNT,
  EXAM_PRACTICE_GENERAL_COUNT,
  EXAM_PRACTICE_QUESTIONS_PER_CASE,
  EXAM_QUESTION_COUNT,
  SAMPLE_QUESTION_COUNT,
} from "@/lib/constants";

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getCategoryCounts(questions: Question[]): Record<string, number> {
  return questions.reduce<Record<string, number>>((acc, question) => {
    acc[question.category] = (acc[question.category] ?? 0) + 1;
    return acc;
  }, {});
}

export function filterByCategories(
  questions: Question[],
  categories: string[]
): Question[] {
  if (!categories.length) return questions;
  const set = new Set(categories);
  return questions.filter((question) => set.has(question.category));
}

export function orderedOptions(question: Question): ShuffledOption[] {
  return (["A", "B", "C", "D"] as AnswerLetter[]).map((letter) => ({
    letter,
    text: question.options[letter],
  }));
}

/** Shuffle answer text while keeping on-screen labels A, B, C, D top-to-bottom. */
export function jumbledDisplayOptions(question: Question): DisplayOption[] {
  const entries = (["A", "B", "C", "D"] as AnswerLetter[]).map((letter) => ({
    originalLetter: letter,
    text: question.options[letter],
  }));
  const shuffled = shuffleArray(entries);
  return (["A", "B", "C", "D"] as AnswerLetter[]).map((displayLetter, index) => ({
    displayLetter,
    originalLetter: shuffled[index].originalLetter,
    text: shuffled[index].text,
  }));
}

export function shuffleOptions(question: Question): ShuffledOption[] {
  const entries = (["A", "B", "C", "D"] as AnswerLetter[]).map((letter) => ({
    letter,
    text: question.options[letter],
  }));
  return shuffleArray(entries);
}

export function selectExamQuestions(questions: Question[]): Question[] {
  if (questions.length <= EXAM_QUESTION_COUNT) {
    return shuffleArray(questions);
  }

  const byCategory = questions.reduce<Record<string, Question[]>>((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});

  const categories = Object.keys(byCategory);
  const selected: Question[] = [];
  const pools = Object.fromEntries(
    categories.map((category) => [category, shuffleArray(byCategory[category])])
  );

  let remaining = EXAM_QUESTION_COUNT;

  while (remaining > 0) {
    let addedThisRound = false;
    for (const category of shuffleArray(categories)) {
      if (remaining === 0) break;
      const pool = pools[category];
      if (pool.length > 0) {
        selected.push(pool.pop()!);
        remaining--;
        addedThisRound = true;
      }
    }
    if (!addedThisRound) break;
  }

  if (selected.length < EXAM_QUESTION_COUNT) {
    const usedIds = new Set(selected.map((q) => q.id));
    const extras = shuffleArray(questions.filter((q) => !usedIds.has(q.id)));
    selected.push(...extras.slice(0, EXAM_QUESTION_COUNT - selected.length));
  }

  return shuffleArray(selected);
}

export interface ExamPracticeSegment {
  type: "general" | "case-study";
  questionIds: number[];
  caseStudyId?: string;
  caseStudyTitle?: string;
  scenario?: string;
}

export interface ExamPracticeSelection {
  questionIds: number[];
  segments: ExamPracticeSegment[];
}

export interface ExamPracticeSessionState {
  questionIds: number[];
  segments: ExamPracticeSegment[];
  answers: Record<number, AnswerLetter | null>;
  currentIndex: number;
  startedAt: number;
  phase: "active" | "results";
  submittedAt?: number;
}

export function createExamPracticeSession(questions: Question[]): ExamPracticeSessionState {
  const selection = selectExamPracticeSession(questions);
  return {
    questionIds: selection.questionIds,
    segments: selection.segments,
    answers: Object.fromEntries(selection.questionIds.map((id) => [id, null])),
    currentIndex: 0,
    startedAt: Date.now(),
    phase: "active",
  };
}

export interface SampleSessionState {
  questionIds: number[];
  answers: Record<number, AnswerLetter | null>;
  currentIndex: number;
  startedAt: number;
  phase: "active" | "complete";
}

export function createSampleSession(questions: Question[]): SampleSessionState {
  const questionIds = shuffleArray(questions)
    .slice(0, SAMPLE_QUESTION_COUNT)
    .map((q) => q.id);

  return {
    questionIds,
    answers: Object.fromEntries(questionIds.map((id) => [id, null])),
    currentIndex: 0,
    startedAt: Date.now(),
    phase: "active",
  };
}

export function selectExamPracticeSession(questions: Question[]): ExamPracticeSelection {
  const generalPool = questions.filter((q) => !q.caseStudyId);
  const caseStudyMap = new Map<string, Question[]>();

  for (const question of questions) {
    if (!question.caseStudyId) continue;
    const group = caseStudyMap.get(question.caseStudyId) ?? [];
    group.push(question);
    caseStudyMap.set(question.caseStudyId, group);
  }

  const fullCaseStudies = [...caseStudyMap.entries()].filter(
    ([, group]) => group.length === EXAM_PRACTICE_QUESTIONS_PER_CASE
  );

  const selectedGeneral = shuffleArray(generalPool).slice(0, EXAM_PRACTICE_GENERAL_COUNT);
  const selectedCaseStudies = shuffleArray(fullCaseStudies).slice(0, EXAM_PRACTICE_CASE_STUDY_COUNT);

  const segments: ExamPracticeSegment[] = [
    {
      type: "general",
      questionIds: selectedGeneral.map((q) => q.id),
    },
    ...selectedCaseStudies.map(([caseStudyId, group]) => {
      const ordered = [...group].sort((a, b) => a.id - b.id);
      return {
        type: "case-study" as const,
        caseStudyId,
        caseStudyTitle: ordered[0].caseStudyTitle,
        scenario: ordered[0].scenario,
        questionIds: ordered.map((q) => q.id),
      };
    }),
  ];

  return {
    questionIds: segments.flatMap((segment) => segment.questionIds),
    segments,
  };
}

export function getExamPracticeSegmentForIndex(
  segments: ExamPracticeSegment[],
  questionIndex: number
): { segment: ExamPracticeSegment; indexInSegment: number } | undefined {
  let offset = 0;
  for (const segment of segments) {
    if (questionIndex < offset + segment.questionIds.length) {
      return { segment, indexInSegment: questionIndex - offset };
    }
    offset += segment.questionIds.length;
  }
  return undefined;
}

export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function buildCategoryStats(
  questions: Question[],
  answers: Record<number, AnswerLetter | null>
): CategoryStats[] {
  const stats = new Map<string, CategoryStats>();

  for (const question of questions) {
    const current = stats.get(question.category) ?? {
      category: question.category,
      correct: 0,
      total: 0,
    };
    current.total += 1;
    if (answers[question.id] === question.correctAnswer) {
      current.correct += 1;
    }
    stats.set(question.category, current);
  }

  return [...stats.values()].sort((a, b) => a.category.localeCompare(b.category));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
