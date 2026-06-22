/**
 * KokonutUI-styled badge wrapper for CeMAP app.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type KokonutBadgeVariant = "default" | "category" | "correct" | "incorrect" | "flagged" | "outline";

const variantStyles: Record<KokonutBadgeVariant, string> = {
  default: "bg-blue-600 text-white border-transparent",
  category: "bg-blue-50 text-blue-800 border-blue-200",
  correct: "bg-blue-50 text-blue-800 border-blue-200",
  incorrect: "bg-red-50 text-red-800 border-red-200",
  flagged: "bg-blue-100 text-blue-800 border-blue-300",
  outline: "bg-white text-blue-700 border-blue-200",
};

interface KokonutBadgeProps {
  children: React.ReactNode;
  variant?: KokonutBadgeVariant;
  className?: string;
}

export function KokonutBadge({
  children,
  variant = "default",
  className,
}: KokonutBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md px-2 py-0.5 text-xs font-medium shadow-none", variantStyles[variant], className)}
    >
      {children}
    </Badge>
  );
}
