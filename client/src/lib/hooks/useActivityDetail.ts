import { useMemo } from "react";
import { useAuditLog, useOrgMembers } from "@/lib/api/hooks";
import { AUDIT_ACTION_META, DEFAULT_AUDIT_META } from "@/lib/utils/org-constants";
import { getInitials } from "@/lib/utils/getInitials";

export function useActivityDetail(activityId: string, orgId?: string) {
  const { data: auditData } = useAuditLog(
    orgId ? { orgId, page: 1, pageSize: 100 } : { orgId: "", page: 1, pageSize: 1 }
  );
  const { data: membersData } = useOrgMembers(orgId);

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    membersData?.members?.forEach(m => map.set(m.userId, m.username));
    return map;
  }, [membersData]);

  const entry = auditData?.entries?.items?.find(e => e.id === activityId);

  const derived = useMemo(() => {
    if (!entry) return null;

    const meta = AUDIT_ACTION_META[entry.action] ?? DEFAULT_AUDIT_META;
    const username = memberMap.get(entry.actorUserId) || entry.actorUserId.slice(0, 8);
    const initials = getInitials(username).slice(0, 2).toUpperCase();
    const timestamp = new Date(entry.timestamp);

    return {
      entry,
      meta,
      username,
      initials,
      timestamp,
    };
  }, [entry, memberMap]);

  return {
    entry,
    derived,
    memberMap,
  };
}