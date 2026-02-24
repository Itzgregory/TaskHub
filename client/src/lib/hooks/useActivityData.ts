import { useState, useMemo } from "react";
import { useAuditLog, useOrgMembers } from "@/lib/api/hooks";
import { AUTH_ACTIONS, getTimeGroup } from "@/lib/utils/activity";

export function useActivityData(orgId?: string, pageSize = 30) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAuditLog(
    orgId ? { orgId, page, pageSize } : { orgId: "", page: 1, pageSize: 1 }
  );

  const { data: membersData } = useOrgMembers(orgId);

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    membersData?.members?.forEach(m => map.set(m.userId, m.username));
    return map;
  }, [membersData]);

  const entries = useMemo(() => {
    if (!data?.entries?.items) return [];
    return data.entries.items.filter(e => !AUTH_ACTIONS.has(e.action));
  }, [data]);

  const groupedEntries = useMemo(() => {
    const today: typeof entries = [];
    const yesterday: typeof entries = [];
    const older: typeof entries = [];

    entries.forEach(entry => {
      const group = getTimeGroup(entry.timestamp);
      if (group === "today") today.push(entry);
      else if (group === "yesterday") yesterday.push(entry);
      else older.push(entry);
    });

    return { today, yesterday, older };
  }, [entries]);

  return {
    page,
    setPage,
    entries,
    groupedEntries,
    memberMap,
    isLoading,
    totalPages: data?.entries?.totalPages ?? 1,
    totalCount: data?.entries?.totalCount ?? 0,
  };
}