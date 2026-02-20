import { useState } from "react";
import {
  FolderKanban, Plus, Search, MoreHorizontal,
  Users, CheckCircle2, Clock, Circle, ArrowUpRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link } from "@tanstack/react-router";

interface OrgProject {
  id: string;
  name: string;
  description: string;
  color: string;
  members: number;
  totalTasks: number;
  completedTasks: number;
  status: "active" | "on-hold" | "completed";
  updatedAt: string;
  lead: string;
}

const PROJECTS: OrgProject[] = [
  { id: "1", name: "Product Redesign", description: "Complete UI/UX overhaul of the main product dashboard and mobile experience", color: "#6366f1", members: 6, totalTasks: 34, completedTasks: 24, status: "active", updatedAt: "2h ago", lead: "Sarah Chen" },
  { id: "2", name: "Mobile App v2", description: "Native mobile application rebuild with React Native and new feature set", color: "#f59e0b", members: 4, totalTasks: 28, completedTasks: 12, status: "active", updatedAt: "30m ago", lead: "Marcus Johnson" },
  { id: "3", name: "Marketing Campaign Q1", description: "Multi-channel marketing campaign for Q1 product launch", color: "#10b981", members: 3, totalTasks: 18, completedTasks: 16, status: "active", updatedAt: "1d ago", lead: "Priya Patel" },
  { id: "4", name: "API Infrastructure", description: "Backend API modernisation, migration to microservices architecture", color: "#3b82f6", members: 5, totalTasks: 42, completedTasks: 13, status: "active", updatedAt: "5h ago", lead: "Alex Kim" },
  { id: "5", name: "Security Audit 2024", description: "Comprehensive security review and compliance certification", color: "#ef4444", members: 2, totalTasks: 15, completedTasks: 15, status: "completed", updatedAt: "1w ago", lead: "Jordan Lee" },
  { id: "6", name: "Design System v3", description: "Unified component library and design token system", color: "#8b5cf6", members: 3, totalTasks: 22, completedTasks: 8, status: "on-hold", updatedAt: "3d ago", lead: "Sarah Chen" },
];

const STATUS_STYLE = {
  active: { bg: "var(--c-greBacSec)", color: "var(--c-greTexAccPri)", label: "Active" },
  "on-hold": { bg: "var(--c-yelBacSec)", color: "var(--c-yelTexAccPri)", label: "On Hold" },
  completed: { bg: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)", label: "Completed" },
};

export default function TeamProjects() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = PROJECTS.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout title="Team Projects" subtitle={`${PROJECTS.length} shared projects`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--c-texDis)" }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="th-input pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="th-select"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => {
          const progress = Math.round((p.completedTasks / p.totalTasks) * 100);
          const sts = STATUS_STYLE[p.status];
          return (
            <Link
              to="/dashboard/org/projects/$projectId"
              params={{ projectId: p.id }}
              key={p.id}
              className="rounded-xl p-5 transition-shadow hover:shadow-[var(--c-shaSM)] cursor-pointer group block"
              style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>{p.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: sts.bg, color: sts.color }}
                  >
                    {sts.label}
                  </span>
                  <button className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--c-bacTer)]">
                    <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--c-texTer)" }}>{p.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Progress</span>
                  <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-bacTer)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: p.color }} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3" style={{ color: "var(--c-texDis)" }} />
                    <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{p.members}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" style={{ color: "var(--c-texDis)" }} />
                    <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{p.completedTasks}/{p.totalTasks}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>{p.updatedAt}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--c-bluTexAccPri)" }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center" style={{ color: "var(--c-texTer)" }}>
          <FolderKanban className="w-8 h-8 mx-auto mb-3" />
          <p className="text-sm">No projects found</p>
        </div>
      )}
    </AppLayout>
  );
}
