import { useOrgMembers } from "@/lib/api/hooks";

export function useOrgMemberMap(orgId: string | undefined) {
  const { data } = useOrgMembers(orgId);
  return new Map(data?.members.map(m => [m.userId, m.username]) ?? []);
}