import { Sun } from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { EmptyState } from "@/components/features/EmptyState";

export function NoOrgState() {
  return (
    <AppLayout title="Today" subtitle="Please select an organisation">
      <EmptyState icon={<Sun className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No organisation selected." />
    </AppLayout>
  );
}