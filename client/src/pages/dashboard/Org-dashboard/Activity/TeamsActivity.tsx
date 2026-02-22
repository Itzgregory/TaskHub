import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/features/EmptyState";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuditLog, useOrgMembers } from "@/lib/api/hooks";
import { AUDIT_ACTION_META, DEFAULT_AUDIT_META } from "@/lib/utils/org-constants";
import type { AuditEntryDto } from "@/lib/api/types";

// Filters: exclude auth events since the user asked for "everything except auth"
const AUTH_ACTIONS = new Set(["LoginSuccess", "LoginFailed", "Logout"]);

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function getTimeGroup(iso: string): "today" | "yesterday" | "older" {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

  if (date >= startOfToday) return "today";
  if (date >= startOfYesterday) return "yesterday";
  return "older";
}

export default function TeamActivity() {
  const { activeOrg } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const { data, isLoading } = useAuditLog(
    activeOrg
      ? { orgId: activeOrg.orgId, page, pageSize }
      : { orgId: "", page: 1, pageSize: 1 }
  );

  // Fetch members to map userId → username
  const { data: membersData } = useOrgMembers(activeOrg?.orgId);
  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    membersData?.members?.forEach(m => map.set(m.userId, m.username));
    return map;
  }, [membersData]);

  // Filter out auth events and group by time
  const entries = useMemo(() => {
    if (!data?.entries?.items) return [];
    return data.entries.items.filter(e => !AUTH_ACTIONS.has(e.action));
  }, [data]);

  const todayEntries = entries.filter(e => getTimeGroup(e.timestamp) === "today");
  const yesterdayEntries = entries.filter(e => getTimeGroup(e.timestamp) === "yesterday");
  const olderEntries = entries.filter(e => getTimeGroup(e.timestamp) === "older");

  const totalPages = data?.entries?.totalPages ?? 1;
  const totalCount = data?.entries?.totalCount ?? 0;

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

  const renderEntry = (entry: AuditEntryDto) => {
    const meta = AUDIT_ACTION_META[entry.action] ?? DEFAULT_AUDIT_META;
    const Icon = meta.icon;
    const username = memberMap.get(entry.actorUserId) || entry.actorUserId.slice(0, 8);
    const initials = username.slice(0, 2).toUpperCase();

    return (
      <div
        key={entry.id}
        className="flex items-start gap-3 px-3 py-3 rounded-lg transition-colors"
        onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: meta.color + "20", color: meta.color }}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm" style={{ color: "var(--c-texPri)" }}>
            <span className="font-medium">{username}</span>{" "}
            <span style={{ color: "var(--c-texTer)" }}>{meta.label}</span>
            {entry.additionalInfo && (
              <span className="font-medium ml-1" style={{ color: "var(--c-texSec)" }}>
                — {entry.additionalInfo}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}
            >
              {meta.entityLabel}
            </span>
            <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>
              {formatTimestamp(entry.timestamp)}
            </span>
            {entry.correlationId && (
              <span
                className="text-[10px] font-mono"
                style={{ color: "var(--c-texDis)" }}
                title={`Correlation: ${entry.correlationId}`}
              >
                #{entry.correlationId.slice(0, 8)}
              </span>
            )}
          </div>
        </div>

        {/* Type icon */}
        <Icon className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: meta.color }} />
      </div>
    );
  };

  const renderGroup = (label: string, items: AuditEntryDto[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
          style={{ color: "var(--c-texTer)" }}
        >
          {label}
        </h3>
        <div className="space-y-1">
          {items.map(renderEntry)}
        </div>
      </div>
    );
  };

  return (
    <AppLayout title="Team Activity" subtitle={`${totalCount} events in ${activeOrg.orgName}`}>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: "var(--c-bluTexAccPri)", borderTopColor: "transparent" }} />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          title="No activity yet"
          description="Actions like creating tasks, adding members, and importing data will appear here."
        />
      ) : (
        <>
          {renderGroup("Today", todayEntries)}
          {renderGroup("Yesterday", yesterdayEntries)}
          {renderGroup("Older", olderEntries)}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-3 py-3 rounded-lg mt-4"
              style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
            >
              <span className="text-xs" style={{ color: "var(--c-texTer)" }}>
                Page {page} of {totalPages} ({totalCount} total events)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="text-xs ml-1">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-7 px-2"
                >
                  <span className="text-xs mr-1">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
