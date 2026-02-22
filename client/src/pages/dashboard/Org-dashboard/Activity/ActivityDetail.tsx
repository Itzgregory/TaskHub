import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Clock, Activity } from "lucide-react";
import { AUDIT_ACTION_META, DEFAULT_AUDIT_META } from "@/lib/utils/org-constants";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuditLog, useOrgMembers } from "@/lib/api/hooks";
import { useMemo } from "react";
import { EmptyState } from "@/components/features/EmptyState";

export default function ActivityDetail() {
  const { activityId } = useParams({ from: "/dashboard/org/activity/$activityId" });
  const { activeOrg } = useAuth();

  // Fetch a large page of audit entries and find the one matching this ID
  // (no single-entry endpoint exists, so we search the list)
  const { data } = useAuditLog(
    activeOrg
      ? { orgId: activeOrg.orgId, page: 1, pageSize: 100 }
      : { orgId: "", page: 1, pageSize: 1 }
  );
  const { data: membersData } = useOrgMembers(activeOrg?.orgId);

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    membersData?.members?.forEach(m => map.set(m.userId, m.username));
    return map;
  }, [membersData]);

  const entry = data?.entries?.items?.find(e => e.id === activityId);

  if (!entry) {
    return (
      <AppLayout title="Activity Detail">
        <Link to="/dashboard/org/activity" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline" style={{ color: "var(--c-bluTexAccPri)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Activity
        </Link>
        <EmptyState
          icon={<Activity className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="Event not found"
          description="This audit event may have been paginated out or doesn't exist."
        />
      </AppLayout>
    );
  }

  const meta = AUDIT_ACTION_META[entry.action] ?? DEFAULT_AUDIT_META;
  const TypeIcon = meta.icon;
  const username = memberMap.get(entry.actorUserId) || entry.actorUserId.slice(0, 8);
  const initials = username.slice(0, 2).toUpperCase();
  const timestamp = new Date(entry.timestamp);

  return (
    <AppLayout title="Activity Detail" subtitle={meta.label}>
      {/* Back link */}
      <Link to="/dashboard/org/activity" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline" style={{ color: "var(--c-bluTexAccPri)" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Activity
      </Link>

      {/* Event header */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: meta.color + "20", color: meta.color }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-base font-semibold" style={{ color: "var(--c-texPri)" }}>{username}</h2>
              <span className="text-sm" style={{ color: "var(--c-texTer)" }}>{meta.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--c-texTer)" }}>
              <span className="flex items-center gap-1">
                <TypeIcon className="w-3 h-3" style={{ color: meta.color }} />
                {meta.entityLabel}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timestamp.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Event Details</h3>
          <div className="space-y-2">
            {[
              { label: "Action", value: entry.action },
              { label: "Entity Type", value: entry.entityType },
              { label: "Entity ID", value: entry.entityId || "—" },
              { label: "Actor", value: username },
              { label: "Actor ID", value: entry.actorUserId },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "var(--c-texTer)" }}>{label}</span>
                <span className="font-mono text-xs" style={{ color: "var(--c-texSec)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Trace Info</h3>
          <div className="space-y-2">
            {[
              { label: "Correlation ID", value: entry.correlationId },
              { label: "Timestamp (UTC)", value: timestamp.toISOString() },
              { label: "Entry ID", value: entry.id },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{label}</span>
                <p className="font-mono text-xs mt-0.5 break-all" style={{ color: "var(--c-texSec)" }}>{value}</p>
              </div>
            ))}
            {entry.additionalInfo && (
              <div>
                <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Additional Info</span>
                <p className="text-sm mt-0.5" style={{ color: "var(--c-texSec)" }}>{entry.additionalInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
