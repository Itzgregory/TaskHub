import { AppLayout } from "@/components/layout/dashboard/AppLayout";

export function LoadingState() {
  return (
    <AppLayout title="Member" subtitle="Loading...">
      <div className="flex items-center justify-center py-16">
        <span className="text-sm" style={{ color: "var(--c-texTer)" }}>Loading member…</span>
      </div>
    </AppLayout>
  );
}