"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuestions } from "@/context/QuestionsContext";
import { createAdaptiveSession } from "@/lib/adaptive-exam";
import { STORAGE_KEYS } from "@/lib/constants";
import { clearSessionItem, setSessionItem } from "@/lib/storage";
import { createExamPracticeSession } from "@/lib/quiz-utils";
import { cn } from "@/lib/utils";

const links = [
  { label: "Exam", href: "/exam-practice", action: "exam" as const },
  { label: "Adaptive", href: "/adaptive", action: "adaptive" as const },
  { label: "Pricing", href: "/pricing", action: "link" as const },
  { label: "FAQ", href: "/faq", action: "link" as const },
];

export function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { questions } = useQuestions();

  function startExam() {
    clearSessionItem(STORAGE_KEYS.examPracticeSession);
    setSessionItem(STORAGE_KEYS.examPracticeSession, createExamPracticeSession(questions));
    router.push("/exam-practice");
  }

  function startAdaptive() {
    clearSessionItem(STORAGE_KEYS.adaptiveExamSession);
    setSessionItem(STORAGE_KEYS.adaptiveExamSession, createAdaptiveSession());
    router.push("/adaptive");
  }

  function handleNavClick(action: (typeof links)[number]["action"], href: string) {
    if (action === "exam") {
      startExam();
      return;
    }
    if (action === "adaptive") {
      startAdaptive();
      return;
    }
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-50 bg-stone-100 px-4 py-4 md:px-6">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-blue-200 bg-white px-4 py-2.5 shadow-none md:px-6"
        aria-label="Main"
      >
        <Link
          href="/"
          className="shrink-0 text-base font-bold tracking-tight text-blue-950 md:text-lg"
        >
          CeMAP Part 1
        </Link>

        <ul className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => handleNavClick(link.action, link.href)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-blue-800 hover:bg-blue-50 hover:text-blue-950"
                  )}
                >
                  {link.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
