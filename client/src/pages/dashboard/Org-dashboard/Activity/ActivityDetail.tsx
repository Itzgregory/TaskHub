import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { useParams } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { ActivityBackButton } from "@/components/features/activityDetails/ActivityBackButton";
import { ActivityHeader } from "@/components/features/activityDetails/ActivityHeader";
import { EventDetailsCard } from "@/components/features/activityDetails/EventDetailsCard";
import { TraceInfoCard } from "@/components/features/activityDetails/TraceInfoCard";
import { ActivityNotFound } from "@/components/features/activityDetails/ActivityNotFound";
import { useActivityDetail } from "@/lib/hooks/useActivityDetail";

export default function ActivityDetail() {
  const { activityId } = useParams({ from: "/dashboard/org/activity/$activityId" });
  const { activeOrg } = useAuth();

  const { entry, derived } = useActivityDetail(activityId, activeOrg?.orgId);

  if (!entry || !derived) {
    return <ActivityNotFound />;
  }

  const { meta, username, initials, timestamp } = derived;

  return (
    <AppLayout title="Activity Detail" subtitle={meta.label}>
      <ActivityBackButton />

      <ActivityHeader
        username={username}
        initials={initials}
        meta={meta}
        timestamp={timestamp}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EventDetailsCard entry={entry} username={username} />
        <TraceInfoCard entry={entry} timestamp={timestamp} />
      </div>
    </AppLayout>
  );
}