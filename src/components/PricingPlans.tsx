import { SectionCard, SectionHeading } from "@/components/SectionCard";
import { cn } from "@/lib/utils";

const includedFeatures = [
  "Adaptive learning that targets weaker areas",
  "Questions mapped to the official CeMAP syllabus",
  "Exam-style questions and mock papers",
  "Detailed answer corrections",
  "Step-by-step guidance and explanations",
  "Case study practice questions",
  "Performance tracking and progress monitoring",
];

const plans = [
  { price: "£50", label: "1 Month Access", featured: false },
  { price: "£100", label: "3 Months Access", featured: true },
] as const;

export function WhatsIncluded({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className={cn(showHeading ? "space-y-6" : undefined)}>
      {showHeading ? <SectionHeading className="text-center">What&apos;s Included</SectionHeading> : null}
      <SectionCard>
        <ul className="space-y-2 text-base leading-relaxed text-blue-700">
          {includedFeatures.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="shrink-0 text-brand-blue" aria-hidden>
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </section>
  );
}

export function PricingOptions({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className={cn(showHeading ? "space-y-6" : undefined)}>
      {showHeading ? <SectionHeading className="text-center">Pricing</SectionHeading> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <SectionCard key={plan.price} className="bg-blue-50 text-center">
            <p className="font-heading text-3xl font-bold text-brand-blue sm:text-4xl">
              {plan.price}
            </p>
            <p className="mt-2 text-base font-semibold italic text-blue-950">
              {plan.label}
              {plan.featured ? (
                <span className="ml-1 text-yellow-500 not-italic" aria-label="Most popular">
                  ★
                </span>
              ) : null}
            </p>
          </SectionCard>
        ))}
      </div>
    </section>
  );
}

export function PricingPlans({ showSectionHeadings = true }: { showSectionHeadings?: boolean }) {
  return (
    <div className="space-y-4">
      <WhatsIncluded showHeading={showSectionHeadings} />
      <PricingOptions showHeading={showSectionHeadings} />
    </div>
  );
}
