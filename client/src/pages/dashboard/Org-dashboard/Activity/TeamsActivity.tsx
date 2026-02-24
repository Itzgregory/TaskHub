import { Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Activity } from "lucide-react";
import { EmptyState } from "@/components/features/EmptyState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useActivityData } from "@/lib/hooks/useActivityData";
import { ActivityGroup } from "@/components/features/activityList/ActivityGroup";
import { ActivityPagination } from "@/components/features/activityList/ActivityPagination";
import { ActivityLoading } from "@/components/features/activityList/ActivityLoading";
import { ActivityEmptyState } from "@/components/features/activityList/ActivityEmptyState";

export default function TeamActivity() {
  const { activeOrg } = useAuth();
  const navigate = useNavigate();
  
  const {
    page,
    setPage,
    groupedEntries,
    memberMap,
    isLoading,
    totalPages,
    totalCount,
  } = useActivityData(activeOrg?.orgId, 30);

  const handleEntryClick = (entryId: string) => {
    navigate({ 
      to: '/dashboard/org/activity/$activityId', 
      params: { activityId: entryId } 
    });
  };

  if (!activeOrg) {
    return (
      <AppLayout title="Team Activity" subtitle="Select an organisation to view activity">
        <EmptyState
          icon={<Activity className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="No organisation selected"
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Team Activity" subtitle={`${totalCount} events in ${activeOrg.orgName}`}>
      {isLoading ? (
        <ActivityLoading />
      ) : groupedEntries.today.length === 0 && 
           groupedEntries.yesterday.length === 0 && 
           groupedEntries.older.length === 0 ? (
        <ActivityEmptyState />
      ) : (
        <>
          <ActivityGroup
            label="Today"
            entries={groupedEntries.today}
            memberMap={memberMap}
            onEntryClick={handleEntryClick}
          />
          <ActivityGroup
            label="Yesterday"
            entries={groupedEntries.yesterday}
            memberMap={memberMap}
            onEntryClick={handleEntryClick}
          />
          <ActivityGroup
            label="Older"
            entries={groupedEntries.older}
            memberMap={memberMap}
            onEntryClick={handleEntryClick}
          />

          <ActivityPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </>
      )}
    </AppLayout>
  );
}