import { Activity } from "lucide-react";
import { EmptyState } from "@/components/features/EmptyState";

export function ActivityEmptyState() {
  return (
    <EmptyState
      icon={<Activity className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
      title="No activity yet"
      description="Actions like creating tasks, adding members, and importing data will appear here."
    />
  );
}