import {
  ArrowLeft, Mail, Calendar, Clock, CheckCircle2,
  FolderKanban, BarChart3, MessageSquare, MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { ProgressBar } from "@/components/features/ProgressBar";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "@tanstack/react-router";
import { ROLE_META } from "@/lib/utils/org-constants";

interface MemberData {
  id: string; name: string; email: string; avatar: string; color: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "invited" | "inactive";
  department: string; joinedAt: string; lastActive: string;
  tasksCompleted: number; tasksInProgress: number; tasksTodo: number;
  projects: { name: string; color: string; role: string }[];
  recentActivity: { action: string; target: string; time: string }[];
  stats: { label: string; value: string }[];
}

const MEMBERS_DATA: Record<string, MemberData> = {
  "1": {
    id: "1", name: "Alex Johnson", email: "alex@taskhub.app", avatar: "AJ", color: "#8b5cf6",
    role: "owner", status: "active", department: "Engineering",
    joinedAt: "Oct 12, 2023", lastActive: "Now",
    tasksCompleted: 143, tasksInProgress: 8, tasksTodo: 5,
    projects: [
      { name: "Product Redesign", color: "#6366f1", role: "Owner" },
      { name: "API Infrastructure", color: "#3b82f6", role: "Lead" },
      { name: "Mobile App v2", color: "#f59e0b", role: "Contributor" },
    ],
    recentActivity: [
      { action: "completed", target: "Sprint planning doc", time: "10m ago" },
      { action: "commented on", target: "API rate limiting spec", time: "1h ago" },
      { action: "created", target: "Q1 roadmap review", time: "3h ago" },
      { action: "moved", target: "Auth refactor → Done", time: "5h ago" },
      { action: "assigned", target: "SSO integration to DevOps", time: "Yesterday" },
    ],
    stats: [
      { label: "Avg. tasks/week", value: "12" },
      { label: "On-time rate", value: "94%" },
      { label: "Comments", value: "287" },
      { label: "Reviews given", value: "63" },
    ],
  },
  "2": {
    id: "2", name: "Sarah Chen", email: "sarah@taskhub.app", avatar: "SC", color: "#6366f1",
    role: "admin", status: "active", department: "Design",
    joinedAt: "Nov 3, 2023", lastActive: "2m ago",
    tasksCompleted: 98, tasksInProgress: 5, tasksTodo: 3,
    projects: [
      { name: "Product Redesign", color: "#6366f1", role: "Lead" },
      { name: "Design System v3", color: "#8b5cf6", role: "Owner" },
    ],
    recentActivity: [
      { action: "completed", target: "Design system audit", time: "2m ago" },
      { action: "uploaded", target: "Brand guidelines v3.pdf", time: "4h ago" },
      { action: "commented on", target: "Icon set revision", time: "6h ago" },
      { action: "created", target: "Component library spec", time: "Yesterday" },
    ],
    stats: [
      { label: "Avg. tasks/week", value: "9" },
      { label: "On-time rate", value: "97%" },
      { label: "Comments", value: "194" },
      { label: "Reviews given", value: "42" },
    ],
  },
};

const fallbackMember = MEMBERS_DATA["1"];



export default function MemberDetail() {
  const { memberId } = useParams({ from: "/dashboard/org/members/$memberId" });
  const member = MEMBERS_DATA[memberId || ""] || fallbackMember;
  const roleMeta = ROLE_META[member.role];
  const RoleIcon = roleMeta.icon;
  const totalTasks = member.tasksCompleted + member.tasksInProgress + member.tasksTodo;

  return (
    <AppLayout title={member.name} subtitle="Member profile">
      {/* Back link */}
      <Link to="/dashboard/org/members" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline" style={{ color: "var(--c-bluTexAccPri)" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
      </Link>

      {/* Profile header */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0" style={{ backgroundColor: member.color + "20", color: member.color }}>
            {member.avatar}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold" style={{ color: "var(--c-texPri)" }}>{member.name}</h2>
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: member.color + "15", color: roleMeta.color }}>
                <RoleIcon className="w-3 h-3" />{roleMeta.label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.status === "active" ? "var(--c-greTexAccPri)" : "var(--c-texDis)" }} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--c-texTer)" }}>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {member.joinedAt}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Active {member.lastActive}</span>
            </div>
            <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-2" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texSec)" }}>{member.department}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 self-start"><MoreHorizontal className="w-4 h-4" style={{ color: "var(--c-texTer)" }} /></Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {member.stats.map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
            <div className="text-xl font-semibold mb-0.5" style={{ color: "var(--c-texPri)" }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: "var(--c-texTer)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Task breakdown + Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task breakdown */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--c-texPri)" }}>Task Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Completed", count: member.tasksCompleted, color: "var(--c-greTexAccPri)" },
                { label: "In Progress", count: member.tasksInProgress, color: "var(--c-bluTexAccPri)" },
                { label: "To Do", count: member.tasksTodo, color: "var(--c-texDis)" },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{b.label}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{b.count}</span>
                  </div>
                  <ProgressBar value={totalTasks ? (b.count / totalTasks) * 100 : 0} color={b.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--c-texPri)" }}>Projects</h3>
            <div className="space-y-2">
              {member.projects.map(p => (
                <div key={p.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "var(--c-bacTer)" }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-medium flex-1" style={{ color: "var(--c-texPri)" }}>{p.name}</span>
                  <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>{p.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3 rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--c-texPri)" }}>Recent Activity</h3>
          <div className="space-y-4">
            {member.recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: member.color + "15" }}>
                  <MessageSquare className="w-3 h-3" style={{ color: member.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--c-texPri)" }}>
                    <span style={{ color: "var(--c-texTer)" }}>{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
