import { PageHeader } from "@/components/PageHeader";

const faqs = [
  {
    q: "What is exam practice mode?",
    a: "A 40-question sitting with 25 general questions and 3 case studies of 5 questions each, matching the style of the real exam.",
  },
  {
    q: "How does adaptive practice work?",
    a: "The exam walks through syllabus topics in order. Answer correctly to move on; get questions wrong and you stay on that topic for extra drill questions until you show competency.",
  },
  {
    q: "Can I try before a full exam?",
    a: "Yes. Use Sample 5 questions on the home page for a quick taster with immediate feedback.",
  },
  {
    q: "Are my mistakes saved?",
    a: "Wrong answers are tracked locally in your browser so you can review them later from the home screen.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader title="FAQ" subtitle="Common questions about CeMAP Part 1 Practice." backHref="/" />

      <ul className="space-y-4">
        {faqs.map((item) => (
          <li key={item.q} className="rounded-md border border-blue-200 bg-white p-5">
            <p className="font-semibold text-blue-950">{item.q}</p>
            <p className="mt-2 text-sm leading-relaxed text-blue-700">{item.a}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
