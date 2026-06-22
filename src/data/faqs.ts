export interface FaqItem {
  question: string;
  answer: string;
  bullets?: string[];
  footer?: string;
}

export const faqs: FaqItem[] = [
  {
    question: "Are these real CeMAP exam questions?",
    answer:
      "Our questions are based on the official CeMAP syllabus and exam format. They are designed to closely reflect the style, structure and difficulty of the real exam.",
  },
  {
    question: "What is the difference between Adaptive and Exam Paper mode?",
    answer:
      "Exam Paper Mode provides a full 40-question sitting, including case study questions, to replicate the real exam experience. Adaptive Mode focuses on your weaker topics by presenting additional questions when you answer incorrectly, helping you improve faster.",
  },
  {
    question: "How does Adaptive Mode work?",
    answer:
      "Adaptive Mode starts with questions from across the syllabus. If you struggle with a particular topic, the system presents additional questions from that area until your understanding improves.",
  },
  {
    question: "Are explanations provided for incorrect answers?",
    answer:
      "Yes. Every question includes a detailed correction and explanation so you can understand why an answer is correct and learn from mistakes.",
  },
  {
    question: "Are case study questions included?",
    answer:
      "Yes. Our question bank includes case study questions similar to those found in the CeMAP examinations, helping you prepare for all aspects of the assessment.",
  },
  {
    question: "How long will I have access for?",
    answer: "You can choose between:",
    bullets: ["£30 for 1 month access", "£60 for 3 months access (our most popular option)"],
    footer: "Access remains available for the full duration of your chosen plan.",
  },
  {
    question: "Is this suitable for someone new to CeMAP?",
    answer:
      "Absolutely. Whether you're studying CeMAP for the first time or revising before an exam, the platform helps identify weaker areas, provides guidance and explanations, and builds confidence through targeted practice.",
  },
];
