"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExamRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/adaptive");
  }, [router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center text-blue-700">
      Redirecting to Adaptive Exam Mode…
    </div>
  );
}
