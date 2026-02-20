import { useMemo, useState } from "react";
import {
  FolderKanban, Search, MoreHorizontal,
  Users, CheckCircle2, ArrowUpRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { ProgressBar } from "@/components/features/ProgressBar";
import { EmptyState } from "@/components/features/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { STATUS_STYLE } from "@/lib/utils/org-constants";

export default function TeamProjects() {
  const { organisations } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // For now, all organisations are treated as active “projects”
  const projects = useMemo(
    () =>
      organisations.map(org => ({
        id: org.orgId,
        name: org.orgName,
        description: "",
        status: "active" as const,
        members: 0,
        totalTasks: 0,
        completedTasks: 0,
        updatedAt: new Date(org.joinedAt).toLocaleDateString(),
        color: "#6366f1",
      })),
    [organisations]
  );

  const filtered = projects.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout title="Team Projects" subtitle={`${projects.length} shared workspaces`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--c-texDis)" }} />
          <Input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-sm"
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
          </select>
          {/* New workspace creation handled on org selection page */}
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
                  </Button>
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
                <ProgressBar value={progress} color={p.color} />
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
        <EmptyState
          icon={<FolderKanban className="w-8 h-8" style={{ color: "var(--c-texDis)" }} />}
          title="No projects found"
        />
      )}
    </AppLayout>
  );
}
