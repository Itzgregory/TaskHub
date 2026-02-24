import type { Priority} from "../../lib/types";

export const PRIORITY_COLOR: Record<string, string> = {
  urgent: "var(--c-redTexAccPri)",
  high: "var(--c-oraTexAccPri)",
  medium: "var(--c-yelTexAccPri)",
  low: "var(--c-greTexAccPri)",
  none: "var(--c-texDis)",
};

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "🔴 Urgent" },
  { value: "high", label: "🟠 High" },
  { value: "medium", label: "🟡 Medium" },
  { value: "low", label: "🟢 Low" },
  { value: "none", label: "— None" },
];