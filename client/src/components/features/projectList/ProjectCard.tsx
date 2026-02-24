import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { STATUS_STYLE } from "@/lib/utils/org-constants";

interface ProjectCardProps {
  id: string;
  name: string;
  status: "active" | "archived";
  joinedAt: string;
}

export function ProjectCard({ id, name, status, joinedAt }: ProjectCardProps) {
  const sts = STATUS_STYLE[status];

  return (
    <Link
      to="/dashboard/org/projects/$projectId"
      params={{ projectId: id }}
      className="rounded-xl p-5 transition-shadow hover:shadow-[var(--c-shaSM)] cursor-pointer group block"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
          >
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>{name}</h3>
            <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>Joined {joinedAt}</span>
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
}