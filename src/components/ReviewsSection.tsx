import { SectionCard, SectionHeading } from "@/components/SectionCard";

const reviews = [
  {
    quote:
      "The adaptive mode quickly picked up the topics I was weak on. I felt much more prepared going into my exam.",
    name: "Sarah M.",
    detail: "Passed CeMAP Part 1",
  },
  {
    quote:
      "The case study questions and explanations were spot on. It felt very close to the real exam format.",
    name: "James T.",
    detail: "Mortgage adviser",
  },
  {
    quote:
      "I used the full exam papers to practise under time pressure. The corrections helped me understand where I was going wrong.",
    name: "Priya K.",
    detail: "CeMAP student",
  },
] as const;

export function ReviewsSection() {
  return (
    <section className="space-y-6">
      <SectionHeading className="text-center">Reviews</SectionHeading>
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <figure key={review.name} className="h-full">
            <SectionCard className="flex h-full flex-col">
              <blockquote className="flex-1 text-base leading-relaxed text-blue-700">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 border-t border-blue-100 pt-4">
                <p className="text-sm font-semibold text-blue-950">{review.name}</p>
                <p className="text-sm text-blue-700">{review.detail}</p>
              </figcaption>
            </SectionCard>
          </figure>
        ))}
      </div>
    </section>
  );
}
