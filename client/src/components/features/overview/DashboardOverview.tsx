import { StatCards } from "./StatCards";
import { RecentActivity } from "./RecentActivity";
import type { ActivityItem } from "./RecentActivity";
import { UpcomingDeadlines } from "./UpcomingDeadlines";
import type { DeadlineItem } from "./UpcomingDeadlines";
import { WorkloadOverview } from "./WorkloadOverview";

interface DashboardOverviewProps {
  stats: {
    openCount: number;
    doneCount: number;
    overdueCount: number;
    memberCount: number;
  };
  activities: ActivityItem[];
  deadlines: DeadlineItem[];
  orgName: string;
  progress: number;
}

export function DashboardOverview({ stats, activities, deadlines, orgName, progress }: DashboardOverviewProps) {
  return (
    <>
      <StatCards {...stats} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <RecentActivity activities={activities} />
        <UpcomingDeadlines deadlines={deadlines} />
      </div>

      <WorkloadOverview
        orgName={orgName}
        progress={progress}
        openCount={stats.openCount}
        memberCount={stats.memberCount}
      />
    </>
  );
}