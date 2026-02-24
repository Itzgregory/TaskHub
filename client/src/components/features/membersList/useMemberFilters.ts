import { useMemo } from "react";
import type { OrgMemberDto } from "@/lib/api/types";
import type { UiRole } from "@/lib/utils/org-constants";

function mapRoleToUi(role: OrgMemberDto['role']): UiRole {
  return role === "OrgAdmin" ? "admin" : "member";
}

export function useMemberFilters(
  members: OrgMemberDto[],
  search: string,
  roleFilter: UiRole | "all"
) {
  return useMemo(() => {
    return members.filter(m => {
      const uiRole = mapRoleToUi(m.role);
      if (roleFilter !== "all" && uiRole !== roleFilter) return false;
      if (search && !m.username.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [members, roleFilter, search]);
}