import Image from "next/image";
import { SectionCard, SectionHeading } from "@/components/SectionCard";

const gridItems = [
  {
    type: "text" as const,
    title: "Adaptive Practice",
    description:
      "Focuses on your weaker topics by providing extra questions where you make mistakes, helping you build confidence and strengthen your understanding.",
  },
  {
    type: "image" as const,
    src: "/why-practice-exam-paper.jpg",
    alt: "Exam paper marked with an A plus grade",
  },
  {
    type: "image" as const,
    src: "/why-practice-answer-sheet.jpg",
    alt: "Answer sheet with multiple choice responses filled in",
  },
  {
    type: "text" as const,
    title: "Exam Paper Practice",
    description:
      "Replicates the real CeMAP exam experience with full-length papers and case studies, helping you improve your timing, exam technique and readiness for the big day.",
  },
];

export function WhyPracticeSection() {
  return (
    <section className="space-y-6 pt-12">
      <SectionHeading className="text-center">Why Practice Questions Work</SectionHeading>

      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-base leading-relaxed text-blue-700 sm:text-lg">
          Reading the syllabus helps you learn. Answering questions helps you pass.
        </p>
        <p className="text-base leading-relaxed text-blue-700">
          Our platform uses two proven study methods:
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 md:max-w-4xl">
        {gridItems.map((item) =>
          item.type === "text" ? (
            <SectionCard
              key={item.title}
              className="flex h-64 flex-col justify-center bg-white p-4 sm:p-5"
            >
              <h3 className="text-sm font-semibold text-blue-950 sm:text-base">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-700">{item.description}</p>
            </SectionCard>
          ) : (
            <div
              key={item.src}
              className="relative h-64 overflow-hidden rounded-md border border-blue-200"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 400px"
              />
            </div>
          )
        )}
      </div>

      <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-blue-700">
        Together, they help you identify knowledge gaps, reinforce learning and prepare for exam
        success.
      </p>
    </section>
  );
}
