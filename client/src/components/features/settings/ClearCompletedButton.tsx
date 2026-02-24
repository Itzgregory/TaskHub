import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearCompletedButtonProps {
  onClear: () => void;
  completedCount: number;
}

export function ClearCompletedButton({ onClear, completedCount }: ClearCompletedButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClear}
      className="w-full flex items-center justify-start gap-3 h-auto py-3 px-4"
      style={{
        borderColor: "var(--c-borPri)",
        backgroundColor: "var(--c-bacSec)",
        color: "var(--c-texPri)",
      }}
      disabled={completedCount === 0}
      onMouseEnter={(e) => {
        if (!completedCount) return;
        e.currentTarget.style.backgroundColor = "var(--c-redBacSec)";
        e.currentTarget.style.borderColor = "var(--c-redBorPri)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--c-bacSec)";
        e.currentTarget.style.borderColor = "var(--c-borPri)";
      }}
    >
      <Trash2 className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
      <div className="text-left">
        <div className="text-sm font-medium">Clear Completed Tasks</div>
        <div className="text-xs" style={{ color: "var(--c-texTer)" }}>
          {completedCount === 0
            ? "No completed tasks"
            : `Remove ${completedCount} completed task(s)`}
        </div>
      </div>
    </Button>
  );
}