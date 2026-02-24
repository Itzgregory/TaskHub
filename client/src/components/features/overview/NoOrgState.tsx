import { Building2 } from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { EmptyState } from "@/components/features/EmptyState";

export function NoOrgState() {
  return (
    <AppLayout title="Organisation" subtitle="Select an organisation to view its dashboard">
      <EmptyState
        icon={<Building2 className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
        title="No organisation selected."
      />
    </AppLayout>
  );
}