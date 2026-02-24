import { useState } from "react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { ManagementBoard } from "@/pages/dashboard/Org-dashboard/Boards/ManagementBoard";
import { ViewToggle } from "@/components/features/overview/ViewToggle";
import { DashboardOverview } from "@/components/features/overview/DashboardOverview";
import { NoOrgState } from "@/components/features/overview/NoOrgState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useDashboardData } from "@/lib/hooks/useDashboardData";

export default function OrgDashboard() {
  const { activeOrg } = useAuth();
  const [view, setView] = useState<'overview' | 'board'>('overview');

  const { stats, recentActivity, upcoming, workloadProgress } = useDashboardData(activeOrg?.orgId);

  if (!activeOrg) {
    return <NoOrgState />;
  }

  return (
    <AppLayout title={activeOrg.orgName} subtitle="Dashboard overview">
      <ViewToggle view={view} onViewChange={setView} />

      {view === 'board' && <ManagementBoard orgId={activeOrg.orgId} />}

      {view === 'overview' && (
        <DashboardOverview
          stats={stats}
          activities={recentActivity}
          deadlines={upcoming}
          orgName={activeOrg.orgName}
          progress={workloadProgress}
        />
      )}
    </AppLayout>
  );
}