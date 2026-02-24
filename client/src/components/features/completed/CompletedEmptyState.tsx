import { CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/features/EmptyState";

export function CompletedEmptyState() {
  return (
    <EmptyState 
      icon={<CheckCircle2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} 
      title="No completed tasks yet" 
      description="Complete tasks to see them here" 
    />
  );
}