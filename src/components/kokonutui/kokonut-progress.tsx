"use client";

/**
 * KokonutUI-styled progress indicator for CeMAP sessions.
 */

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface KokonutProgressProps {
  value: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function KokonutProgress({
  value,
  label,
  showValue = true,
  className,
}: KokonutProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <Progress value={clamped} className={cn("w-full gap-2", className)}>
      {label ? <ProgressLabel className="text-blue-700">{label}</ProgressLabel> : null}
      {showValue ? (
        <ProgressValue className="text-blue-600">
          {() => `${clamped}%`}
        </ProgressValue>
      ) : null}
      <ProgressTrack className="h-2 bg-blue-100">
        <ProgressIndicator className="rounded-full bg-blue-600" />
      </ProgressTrack>
    </Progress>
  );
}

interface SessionProgressProps {
  current: number;
  total: number;
  label?: string;
}

export function SessionProgress({ current, total, label }: SessionProgressProps) {
  const value = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <p className="text-sm text-blue-700">
        {label ?? `Question ${current} of ${total}`}
      </p>
      <KokonutProgress value={value} showValue={false} />
    </div>
  );
}
