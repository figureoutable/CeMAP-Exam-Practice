import { cn } from "@/lib/utils";

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-2xl font-semibold text-blue-950 sm:text-3xl", className)}>
      {children}
    </h2>
  );
}

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-blue-200 bg-white p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}
