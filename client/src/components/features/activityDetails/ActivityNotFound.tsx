import { Activity } from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { EmptyState } from "@/components/features/EmptyState";
import { ActivityBackButton } from "./ActivityBackButton";

export function ActivityNotFound() {
  return (
    <AppLayout title="Activity Detail">
      <ActivityBackButton />
      <EmptyState
        icon={<Activity className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
        title="Event not found"
        description="This audit event may have been paginated out or doesn't exist."
      />
    </AppLayout>
  );
}