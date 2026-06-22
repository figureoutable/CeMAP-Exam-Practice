import { PageHeader } from "@/components/PageHeader";
import { PricingPlans } from "@/components/PricingPlans";

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Pricing"
        subtitle="Choose the plan that fits your study schedule."
        backHref="/"
      />

      <PricingPlans showSectionHeadings={false} />
    </div>
  );
}
