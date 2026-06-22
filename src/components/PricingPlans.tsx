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
  { price: "£30", label: "1 Month Access", featured: false },
  { price: "£60", label: "3 Months Access (Most Popular)", featured: true },
] as const;

export function WhatsIncluded() {
  return (
    <div className="rounded-md border border-blue-200 bg-white px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-4">
      <h2 className="font-heading text-2xl font-bold text-blue-950 sm:text-3xl">
        What&apos;s Included
      </h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-blue-950 sm:text-base">
        {includedFeatures.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="shrink-0 text-brand-blue" aria-hidden>
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PricingOptions() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {plans.map((plan) => (
        <div
          key={plan.price}
          className="rounded-md border border-blue-200 bg-white p-5 text-center sm:p-6"
        >
          <p className="font-heading text-3xl font-bold text-brand-blue sm:text-4xl">
            {plan.price}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold italic text-blue-950 sm:text-base">
            <span>{plan.label}</span>
            {plan.featured ? (
              <span className="text-brand-blue not-italic" aria-hidden>
                ★
              </span>
            ) : null}
          </p>
        </div>
      ))}
    </div>
  );
}

export function PricingPlans() {
  return (
    <div className="space-y-4">
      <WhatsIncluded />
      <PricingOptions />
    </div>
  );
}
