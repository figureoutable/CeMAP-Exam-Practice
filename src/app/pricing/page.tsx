import { PageHeader } from "@/components/PageHeader";

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Pricing"
        subtitle="CeMAP Part 1 Practice is free to use while you prepare for your exam."
        backHref="/"
      />

      <div className="space-y-4">
        <div className="rounded-md border border-blue-200 bg-white p-6">
          <p className="text-lg font-semibold text-blue-950">Free access</p>
          <p className="mt-2 text-sm leading-relaxed text-blue-700">
            Full question bank, exam practice mode, adaptive practice, and sample questions. No
            subscription required.
          </p>
        </div>
      </div>
    </div>
  );
}
