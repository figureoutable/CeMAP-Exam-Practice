export const EXAM_QUESTION_COUNT = 40;
export const EXAM_PRACTICE_GENERAL_COUNT = 25;
export const EXAM_PRACTICE_CASE_STUDY_COUNT = 3;
export const EXAM_PRACTICE_QUESTIONS_PER_CASE = 5;
export const SAMPLE_QUESTION_COUNT = 5;
export const EXAM_DURATION_MINUTES = 60;
export const EXAM_DURATION_MS = EXAM_DURATION_MINUTES * 60 * 1000;
export const PASS_MARK_PERCENTAGE = 70;
export const MAX_WRONG_PER_TOPIC = 3;

export const TOPICS = [
  { name: "Customer Relations & Consumer Duty", total: 10 },
  { name: "Economy & Government Policy", total: 15 },
  { name: "Exchanges & Indices", total: 10 },
  { name: "Financial Crime", total: 10 },
  { name: "Institutions & Markets", total: 15 },
  { name: "Legal Concepts", total: 10 },
  { name: "Money & Asset Classes", total: 10 },
  { name: "Mortgages & Lending", total: 10 },
  { name: "Payments, Clearing & Settlement", total: 10 },
  { name: "Pensions", total: 10 },
  { name: "Protection & General Insurance", total: 15 },
  { name: "Regulation: History & Bodies", total: 15 },
  { name: "SM&CR & Conduct Rules", total: 10 },
  { name: "State Benefits & State Pension", total: 15 },
  { name: "Taxation", total: 15 },
  { name: "Trusts", total: 10 },
  { name: "Wills, Intestacy & Probate", total: 10 },
] as const;

export const STORAGE_KEYS = {
  examResults: "cemap_exam_results",
  mistakeIds: "cemap_mistake_ids",
  practiceSession: "cemap_practice_session",
  examSession: "cemap_exam_session",
  adaptiveExamSession: "cemap_adaptive_exam_session",
  examPracticeSession: "cemap_exam_practice_session",
  sampleSession: "cemap_sample_session",
} as const;
