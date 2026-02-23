import { useMemo, useState } from "react";
import {
  FolderKanban, Search, ArrowUpRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { EmptyState } from "@/components/features/EmptyState";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { STATUS_STYLE } from "@/lib/utils/org-constants";

export default function TeamProjects() {
  const { organisations } = useAuth();
  const [search, setSearch] = useState("");

  const projects = useMemo(
    () =>
      organisations.map(org => ({
        id: org.orgId,
        name: org.orgName,
        status: "active" as const,
        joinedAt: new Date(org.joinedAt).toLocaleDateString(),
      })),
    [organisations]
  );

  const filtered = projects.filter(p => {
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
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => {
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
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                  >
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>{p.name}</h3>
                    <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>Joined {p.joinedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: sts.bg, color: sts.color }}
                  >
                    {sts.label}
                  </span>
                  <ArrowUpRight
                    className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--c-bluTexAccPri)" }}
                  />
                </div>
              </div>

              <p className="text-xs mt-3" style={{ color: "var(--c-texTer)" }}>
                View tasks and manage your team's work in this workspace.
              </p>
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