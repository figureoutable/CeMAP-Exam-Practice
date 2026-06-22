import {
  EXAM_QUESTION_COUNT,
  MAX_WRONG_PER_TOPIC,
  PASS_MARK_PERCENTAGE,
  TOPICS,
} from "@/lib/constants";
import { shuffleArray } from "@/lib/quiz-utils";
import type { AnswerLetter, Question } from "@/types/question";

export interface AdaptiveScore {
  correct: number;
  total: number;
}

export interface AdaptiveExamSession {
  drillTopic: string | null;
  wrongCount: number;
  usedIds: number[];
  score: AdaptiveScore;
  weakTopics: string[];
  status: "active" | "complete";
  startedAt: number;
  completedAt?: number;
}

/** @deprecated Legacy sessions used topicIndex; reset if present. */
interface LegacyAdaptiveExamSession {
  topicIndex?: number;
  drillTopic?: string | null;
}

export function createAdaptiveSession(): AdaptiveExamSession {
  return {
    drillTopic: null,
    wrongCount: 0,
    usedIds: [],
    score: { correct: 0, total: 0 },
    weakTopics: [],
    status: "active",
    startedAt: Date.now(),
  };
}

export function parseAdaptiveSession(raw: unknown): AdaptiveExamSession | null {
  if (!raw || typeof raw !== "object") return null;
  const session = raw as LegacyAdaptiveExamSession & AdaptiveExamSession;
  if ("topicIndex" in session && session.drillTopic === undefined) return null;
  if (session.status !== "active" && session.status !== "complete") return null;
  return session;
}

function pickRandomQuestion(
  questions: Question[],
  usedIds: number[],
  category: string
): Question | null {
  const pool = questions.filter(
    (q) => q.category === category && !usedIds.includes(q.id)
  );
  if (!pool.length) return null;
  return shuffleArray(pool)[0];
}

function pickRandomTopicWithQuestions(
  questions: Question[],
  usedIds: number[]
): string | null {
  const available = TOPICS.map((t) => t.name).filter((topic) =>
    questions.some((q) => q.category === topic && !usedIds.includes(q.id))
  );
  if (!available.length) return null;
  return shuffleArray(available)[0];
}

export function isDrilling(session: AdaptiveExamSession): boolean {
  return session.drillTopic !== null;
}

export function getDrillTopic(session: AdaptiveExamSession): string | null {
  return session.drillTopic;
}

export function getNextQuestion(
  session: AdaptiveExamSession,
  questions: Question[]
): Question | null {
  if (session.status !== "active") return null;
  if (session.score.total >= EXAM_QUESTION_COUNT) return null;

  if (session.drillTopic) {
    const drillQuestion = pickRandomQuestion(
      questions,
      session.usedIds,
      session.drillTopic
    );
    if (drillQuestion) return drillQuestion;
    session.drillTopic = null;
    session.wrongCount = 0;
  }

  const topic = pickRandomTopicWithQuestions(questions, session.usedIds);
  if (!topic) return null;

  return pickRandomQuestion(questions, session.usedIds, topic);
}

export function processAnswer(
  session: AdaptiveExamSession,
  question: Question,
  selected: AnswerLetter
): { isCorrect: boolean; explanation: string } {
  const isCorrect = selected === question.correctAnswer;

  session.usedIds.push(question.id);
  session.score.total++;
  if (isCorrect) session.score.correct++;

  if (session.score.total >= EXAM_QUESTION_COUNT) {
    session.status = "complete";
    session.completedAt = Date.now();
    return { isCorrect, explanation: question.explanation };
  }

  if (session.drillTopic) {
    if (isCorrect) {
      session.drillTopic = null;
      session.wrongCount = 0;
    } else {
      session.wrongCount++;
      if (!session.weakTopics.includes(question.category)) {
        session.weakTopics.push(question.category);
      }
      if (session.wrongCount >= MAX_WRONG_PER_TOPIC) {
        session.drillTopic = null;
        session.wrongCount = 0;
      }
    }
  } else if (!isCorrect) {
    session.drillTopic = question.category;
    session.wrongCount = 1;
    if (!session.weakTopics.includes(question.category)) {
      session.weakTopics.push(question.category);
    }
  }

  return { isCorrect, explanation: question.explanation };
}

export function getAdaptiveSummary(session: AdaptiveExamSession) {
  const { correct, total } = session.score;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    correct,
    total,
    percentage,
    passed: percentage >= PASS_MARK_PERCENTAGE,
    weakTopics: session.weakTopics,
  };
}
