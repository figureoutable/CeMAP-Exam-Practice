"use client";

import { useState } from "react";
import { LiquidButton } from "@/components/kokonutui/liquid-glass-card";
import { resetAllProgress } from "@/lib/storage";

interface ResetProgressButtonProps {
  onReset?: () => void;
}

export function ResetProgressButton({ onReset }: ResetProgressButtonProps) {
  const [confirming, setConfirming] = useState(false);

  function handleReset() {
    resetAllProgress();
    setConfirming(false);
    onReset?.();
  }

  if (!confirming) {
    return (
      <LiquidButton
        variant="outline"
        className="w-full border-red-200 text-red-700 hover:bg-red-50 shadow-none"
        onClick={() => setConfirming(true)}
      >
        Reset all progress
      </LiquidButton>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-800">
        This will permanently delete your exam history and mistake list. This cannot be undone.
      </p>
      <div className="flex gap-2">
        <LiquidButton
          className="flex-1 bg-red-600 text-white hover:bg-red-700 shadow-none"
          onClick={handleReset}
        >
          Yes, reset everything
        </LiquidButton>
        <LiquidButton
          variant="outline"
          className="flex-1 shadow-none"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </LiquidButton>
      </div>
    </div>
  );
}
