import { Check } from "lucide-react";
import { ONBOARDING_STEPS } from "@/lib/constants/onboarding";

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {ONBOARDING_STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  backgroundColor: done
                    ? "var(--c-greTexAccPri)"
                    : active
                    ? "var(--c-bluBacAccPri)"
                    : "var(--c-bacTer)",
                  color: done || active ? "#fff" : "var(--c-texTer)",
                }}
              >
                {done ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{ color: active ? "var(--c-texPri)" : "var(--c-texTer)" }}
              >
                {s}
              </span>
            </div>
            {i < ONBOARDING_STEPS.length - 1 && (
              <div
                className="w-4 sm:w-8 h-px"
                style={{ backgroundColor: done ? "var(--c-greTexAccPri)" : "var(--c-borPri)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}