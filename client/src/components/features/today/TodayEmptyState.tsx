import { Sun } from "lucide-react";
import { EmptyState } from "@/components/features/EmptyState";

export function TodayEmptyState() {
  return (
    <EmptyState 
      icon={<Sun className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} 
      title="No tasks for today" 
      description="Add a task with today's due date to see it here" 
    />
  );
}