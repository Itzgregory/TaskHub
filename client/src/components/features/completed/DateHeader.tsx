import { CheckCircle2 } from "lucide-react";

interface DateHeaderProps {
  date: string;
  taskCount: number;
  formatDate: (date: string) => string;
}

export function DateHeader({ date, taskCount, formatDate }: DateHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--c-greTexAccPri)" }} />
      <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>
        {formatDate(date)}
      </h3>
      <span className="text-xs font-mono px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}>
        {taskCount}
      </span>
    </div>
  );
}