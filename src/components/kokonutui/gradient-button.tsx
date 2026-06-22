import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ColorVariant = "emerald" | "purple" | "orange";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  className?: string;
  variant?: ColorVariant;
}

const variantStyles: Record<ColorVariant, string> = {
  emerald: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
  purple: "bg-blue-700 text-white hover:bg-blue-800 border-blue-700",
  orange: "bg-blue-500 text-white hover:bg-blue-600 border-blue-500",
};

export default function GradientButton({
  label = "Welcome",
  className,
  variant = "emerald",
  ...props
}: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "h-10 w-full rounded-md border text-sm font-medium shadow-none transition-colors",
        variantStyles[variant],
        className
      )}
      variant="ghost"
      {...props}
    >
      {label}
    </Button>
  );
}
