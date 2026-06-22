import { SectionHeading } from "@/components/SectionCard";
import { faqs } from "@/data/faqs";
import { cn } from "@/lib/utils";

interface FaqSectionProps {
  showHeading?: boolean;
  className?: string;
}

export function FaqSection({ showHeading = true, className }: FaqSectionProps) {
  return (
    <section className={cn(showHeading && "space-y-6", className)}>
      {showHeading ? <SectionHeading className="text-center">FAQ</SectionHeading> : null}

      <div className={cn("divide-y divide-blue-100", showHeading ? undefined : "mt-0")}>
        {faqs.map((item) => (
          <details key={item.question} className="group py-5 first:pt-0 sm:py-6">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
              <span className="text-lg font-semibold text-blue-950">{item.question}</span>
              <span
                className="mt-1 shrink-0 text-sm text-brand-blue transition-transform group-open:rotate-180"
                aria-hidden
              >
                ▼
              </span>
            </summary>

            <div className="mt-3 border-t border-blue-100 pt-3">
              <p className="text-base leading-relaxed text-blue-700">{item.answer}</p>
              {item.bullets ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-base leading-relaxed text-blue-700">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {item.footer ? (
                <p className="mt-2 text-base leading-relaxed text-blue-700">{item.footer}</p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
