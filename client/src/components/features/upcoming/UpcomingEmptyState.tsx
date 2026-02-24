import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/features/EmptyState";

export function UpcomingEmptyState() {
  return (
    <EmptyState 
      icon={<CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} 
      title="Nothing upcoming" 
      description="Add tasks with future due dates" 
    />
  );
}