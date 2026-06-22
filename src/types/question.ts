export type AnswerLetter = "A" | "B" | "C" | "D";

export interface Question {
  id: number;
  category: string;
  question: string;
  options: Record<AnswerLetter, string>;
  correctAnswer: AnswerLetter;
  explanation: string;
  caseStudyId?: string;
  caseStudyTitle?: string;
  scenario?: string;
}

export interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  percentage: number;
  timeTakenSeconds: number;
  passed: boolean;
}

export interface CategoryStats {
  category: string;
  correct: number;
  total: number;
}

export interface ShuffledOption {
  letter: AnswerLetter;
  text: string;
}

/** Display labels stay A–D in order; answer text is shuffled underneath. */
export interface DisplayOption {
  displayLetter: AnswerLetter;
  originalLetter: AnswerLetter;
  text: string;
}
