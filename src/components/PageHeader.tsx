"use client";

import Link from "next/link";
import { IconChevronLeft } from "@/components/icons";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Home",
}: PageHeaderProps) {
  return (
    <header className="mb-6 space-y-3">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          <IconChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      ) : null}
      <div>
        <h1 className="font-heading text-2xl font-normal tracking-tight text-blue-950 sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-blue-700 sm:text-base">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
