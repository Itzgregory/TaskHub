import { useState } from "react";
import {
  Users, Search, Plus, MoreHorizontal, Mail, Shield,
  ShieldCheck, Crown, UserCircle, Filter,
} from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link } from "@tanstack/react-router";

type Role = "owner" | "admin" | "member" | "viewer";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status: "active" | "invited" | "inactive";
  lastActive: string;
  tasksCompleted: number;
  department: string;
}

const MEMBERS: Member[] = [
  { id: "1", name: "Alex Johnson", email: "alex@taskhub.app", avatar: "AJ", role: "owner", status: "active", lastActive: "Now", tasksCompleted: 143, department: "Engineering" },
  { id: "2", name: "Sarah Chen", email: "sarah@taskhub.app", avatar: "SC", role: "admin", status: "active", lastActive: "2m ago", tasksCompleted: 98, department: "Design" },
  { id: "3", name: "Marcus Johnson", email: "marcus@taskhub.app", avatar: "MJ", role: "member", status: "active", lastActive: "15m ago", tasksCompleted: 76, department: "Engineering" },
  { id: "4", name: "Priya Patel", email: "priya@taskhub.app", avatar: "PP", role: "member", status: "active", lastActive: "1h ago", tasksCompleted: 112, department: "Marketing" },
  { id: "5", name: "Jordan Lee", email: "jordan@taskhub.app", avatar: "JL", role: "admin", status: "active", lastActive: "3h ago", tasksCompleted: 64, department: "Product" },
  { id: "6", name: "Taylor Swift", email: "taylor@taskhub.app", avatar: "TS", role: "member", status: "invited", lastActive: "—", tasksCompleted: 0, department: "Marketing" },
  { id: "7", name: "Sam Nakamura", email: "sam@taskhub.app", avatar: "SN", role: "viewer", status: "active", lastActive: "1d ago", tasksCompleted: 22, department: "Sales" },
  { id: "8", name: "Riley Anderson", email: "riley@taskhub.app", avatar: "RA", role: "member", status: "inactive", lastActive: "2w ago", tasksCompleted: 31, department: "Engineering" },
];

const ROLE_META: Record<Role, { icon: typeof Crown; label: string; color: string }> = {
  owner: { icon: Crown, label: "Owner", color: "var(--c-yelTexAccPri)" },
  admin: { icon: ShieldCheck, label: "Admin", color: "var(--c-bluTexAccPri)" },
  member: { icon: UserCircle, label: "Member", color: "var(--c-greTexAccPri)" },
  viewer: { icon: Shield, label: "Viewer", color: "var(--c-texTer)" },
};

const STATUS_STYLE: Record<string, { dot: string; label: string }> = {
  active: { dot: "var(--c-greTexAccPri)", label: "Active" },
  invited: { dot: "var(--c-yelTexAccPri)", label: "Invited" },
  inactive: { dot: "var(--c-texDis)", label: "Inactive" },
};

export default function TeamMembers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const filtered = MEMBERS.filter(m => {
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout title="Team Members" subtitle={`${MEMBERS.length} members in your organisation`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--c-texDis)" }} />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="th-input pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as Role | "all")}
            className="th-select"
          >
            <option value="all">All roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </button>
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
          const roleMeta = ROLE_META[m.role];
          const statusMeta = STATUS_STYLE[m.status];
          const RoleIcon = roleMeta.icon;
          return (
            <Link
              to="/dashboard/org/members/$memberId"
              params={{ memberId: m.id }}
              key={m.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 items-center transition-colors hover:bg-[var(--c-bacTer)]"
              style={{ borderTop: "1px solid var(--c-borPri)", backgroundColor: "var(--c-bacSec)" }}
            >
              {/* Member */}
              <div className="md:col-span-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                >
                  {m.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>{m.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--c-texTer)" }}>{m.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="md:col-span-2 flex items-center gap-1.5">
                <RoleIcon className="w-3.5 h-3.5" style={{ color: roleMeta.color }} />
                <span className="text-xs font-medium" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
              </div>

              {/* Department */}
              <div className="md:col-span-2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texSec)" }}>{m.department}</span>
              </div>

              {/* Status */}
              <div className="md:col-span-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusMeta.dot }} />
                <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{statusMeta.label}</span>
              </div>

              {/* Last Active */}
              <div className="md:col-span-2">
                <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>{m.lastActive}</span>
              </div>

              {/* Tasks */}
              <div className="md:col-span-1 flex items-center justify-end gap-2">
                <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{m.tasksCompleted}</span>
                <button className="p-1 rounded hover:bg-[var(--c-bacTer)]">
                  <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
                </button>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: "var(--c-texTer)" }}>
            <Users className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">No members found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
