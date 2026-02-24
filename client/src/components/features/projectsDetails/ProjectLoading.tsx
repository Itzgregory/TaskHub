import { AppLayout } from "@/components/layout/dashboard/AppLayout";

export function ProjectLoading() {
  return (
    <AppLayout title="Project" subtitle="Loading...">
      <div className="flex items-center justify-center py-16">
        <span className="text-sm" style={{ color: "var(--c-texTer)" }}>Loading project…</span>
      </div>
    </AppLayout>
  );
}