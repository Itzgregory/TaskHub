import { useMemo, useState } from "react";
import {
  Users, Search, Plus, MoreHorizontal,
} from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { EmptyState } from "@/components/features/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers } from "@/lib/api/hooks";
import type { OrgMemberDto, UserRole } from "@/lib/api/types";
import { ROLE_META, type UiRole } from "@/lib/utils/org-constants";

function mapRoleToUi(role: UserRole): UiRole {
  return role === "OrgAdmin" ? "admin" : "member";
}

export default function TeamMembers() {
  const { activeOrg } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UiRole | "all">("all");

  const { data, isLoading } = useOrgMembers(activeOrg?.orgId);

  const members = useMemo<OrgMemberDto[]>(
    () => data?.members ?? [],
    [data]
  );

  const filtered = useMemo(() => {
    return members.filter(m => {
      const uiRole = mapRoleToUi(m.role);
      if (roleFilter !== "all" && uiRole !== roleFilter) return false;
      if (search && !m.username.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [members, roleFilter, search]);

  return (
    <AppLayout
      title="Team Members"
      subtitle={
        activeOrg
          ? `${members.length} members in ${activeOrg.orgName}`
          : "Select an organisation to view members"
      }
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--c-texDis)" }} />
          <Input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UiRole | "all")}
            className="th-select"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <Button
            disabled={!activeOrg}
            style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)", opacity: activeOrg ? 1 : 0.5 }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>
      </div>

      {/* Members table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)" }}>
        {/* Header */}
        <div
          className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}
        >
          <div className="col-span-4">Member</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Last Active</div>
          <div className="col-span-1 text-right">Tasks</div>
        </div>

        {/* Rows */}
        {filtered.map(m => {
          const uiRole = mapRoleToUi(m.role);
          const roleMeta = ROLE_META[uiRole];
          const RoleIcon = roleMeta.icon;
          return (
            <Link
              to="/dashboard/org/members/$memberId"
              params={{ memberId: m.userId }}
              key={m.userId}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 items-center transition-colors hover:bg-[var(--c-bacTer)]"
              style={{ borderTop: "1px solid var(--c-borPri)", backgroundColor: "var(--c-bacSec)" }}
            >
              {/* Member */}
              <div className="md:col-span-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                >
                  {m.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>{m.username}</p>
                  <p className="text-xs truncate" style={{ color: "var(--c-texTer)" }}>{uiRole === "admin" ? "Org Admin" : "Member"}</p>
                </div>
              </div>

              {/* Role */}
              <div className="md:col-span-2 flex items-center gap-1.5">
                <RoleIcon className="w-3.5 h-3.5" style={{ color: roleMeta.color }} />
                <span className="text-xs font-medium" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
              </div>

              {/* Placeholder department */}
              <div className="md:col-span-2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texSec)" }}>—</span>
              </div>

              {/* Status (simplified as active) */}
              <div className="md:col-span-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--c-greTexAccPri)" }} />
                <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Active</span>
              </div>

              {/* Last Active */}
              <div className="md:col-span-2">
                <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>—</span>
              </div>

              {/* Tasks */}
              <div className="md:col-span-1 flex items-center justify-end gap-2">
                <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>—</span>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
                </Button>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            icon={<Users className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
            title="No members found"
          />
        )}
      </div>
    </AppLayout>
  );
}
