import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft, Users, CheckCircle2, Clock, Circle, MoreHorizontal,
  Plus, Calendar, Target, MessageSquare, Paperclip, AlertCircle,
} from "lucide-react";

interface ProjectTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: "urgent" | "high" | "medium" | "low";
  assignee: { name: string; avatar: string; color: string };
  dueDate: string;
  comments: number;
}

interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  progress: number;
  tasksDone: number;
  tasksTotal: number;
}

const PROJECTS_DATA: Record<string, {
  name: string; description: string; color: string; status: "active" | "on-hold" | "completed";
  lead: string; members: { name: string; avatar: string; color: string; role: string }[];
  totalTasks: number; completedTasks: number; createdAt: string;
  tasks: ProjectTask[]; milestones: ProjectMilestone[];
}> = {
  "1": {
    name: "Product Redesign", description: "Complete UI/UX overhaul of the main product dashboard and mobile experience. Modernise design language, improve accessibility, and reduce user friction across all key workflows.", color: "#6366f1", status: "active",
    lead: "Sarah Chen", createdAt: "Jan 15, 2025", totalTasks: 34, completedTasks: 24,
    members: [
      { name: "Sarah Chen", avatar: "SC", color: "#6366f1", role: "Lead" },
      { name: "Marcus Johnson", avatar: "MJ", color: "#f59e0b", role: "Developer" },
      { name: "Alex Kim", avatar: "AK", color: "#3b82f6", role: "Designer" },
      { name: "Priya Patel", avatar: "PP", color: "#10b981", role: "QA" },
      { name: "Jordan Lee", avatar: "JL", color: "#ec4899", role: "Developer" },
      { name: "Sam Nakamura", avatar: "SN", color: "#14b8a6", role: "Developer" },
    ],
    tasks: [
      { id: "t1", title: "Finalise colour palette and typography", status: "done", priority: "high", assignee: { name: "Alex Kim", avatar: "AK", color: "#3b82f6" }, dueDate: "Feb 10", comments: 4 },
      { id: "t2", title: "Redesign navigation sidebar", status: "done", priority: "high", assignee: { name: "Sarah Chen", avatar: "SC", color: "#6366f1" }, dueDate: "Feb 12", comments: 7 },
      { id: "t3", title: "Build responsive dashboard grid", status: "in_progress", priority: "medium", assignee: { name: "Marcus Johnson", avatar: "MJ", color: "#f59e0b" }, dueDate: "Feb 20", comments: 3 },
      { id: "t4", title: "Implement dark mode toggle", status: "in_progress", priority: "medium", assignee: { name: "Jordan Lee", avatar: "JL", color: "#ec4899" }, dueDate: "Feb 22", comments: 1 },
      { id: "t5", title: "Mobile breakpoint testing", status: "todo", priority: "high", assignee: { name: "Priya Patel", avatar: "PP", color: "#10b981" }, dueDate: "Feb 25", comments: 0 },
      { id: "t6", title: "Accessibility audit pass", status: "todo", priority: "urgent", assignee: { name: "Sam Nakamura", avatar: "SN", color: "#14b8a6" }, dueDate: "Feb 28", comments: 2 },
    ],
    milestones: [
      { id: "m1", title: "Design System Complete", dueDate: "Feb 15", progress: 100, tasksDone: 8, tasksTotal: 8 },
      { id: "m2", title: "Core UI Rebuild", dueDate: "Feb 25", progress: 60, tasksDone: 6, tasksTotal: 10 },
      { id: "m3", title: "QA & Launch", dueDate: "Mar 10", progress: 12, tasksDone: 2, tasksTotal: 16 },
    ],
  },
};

// Fallback for unknown IDs — reuse project 1 data with tweaked name
const fallbackProject = PROJECTS_DATA["1"];

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "var(--c-greBacSec)", color: "var(--c-greTexAccPri)", label: "Active" },
  "on-hold": { bg: "var(--c-yelBacSec)", color: "var(--c-yelTexAccPri)", label: "On Hold" },
  completed: { bg: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)", label: "Completed" },
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "var(--c-redTexAccPri)",
  high: "var(--c-oraTexAccPri)",
  medium: "var(--c-yelTexAccPri)",
  low: "var(--c-texTer)",
};

const TASK_STATUS_ICON: Record<string, { icon: typeof Circle; color: string }> = {
  todo: { icon: Circle, color: "var(--c-texDis)" },
  in_progress: { icon: Clock, color: "var(--c-bluTexAccPri)" },
  done: { icon: CheckCircle2, color: "var(--c-greTexAccPri)" },
};

export default function ProjectDetail() {
  const { projectId } = useParams({ from: "/dashboard/org/projects/$projectId" });
  const project = PROJECTS_DATA[projectId || ""] || fallbackProject;
  const progress = Math.round((project.completedTasks / project.totalTasks) * 100);
  const sts = STATUS_BADGE[project.status];

  return (
    <AppLayout title={project.name} subtitle="Project details">
      {/* Back link */}
      <Link to="/dashboard/org/projects" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline" style={{ color: "var(--c-bluTexAccPri)" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </Link>

      {/* Header card */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--c-texPri)" }}>{project.name}</h2>
              <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Lead: {project.lead} · Created {project.createdAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: sts.bg, color: sts.color }}>{sts.label}</span>
            <button className="p-1.5 rounded-lg hover:bg-[var(--c-bacTer)]"><MoreHorizontal className="w-4 h-4" style={{ color: "var(--c-texTer)" }} /></button>
          </div>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--c-texSec)" }}>{project.description}</p>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--c-texTer)" }}>Overall Progress</span>
            <span className="text-xs font-mono" style={{ color: "var(--c-texSec)" }}>{project.completedTasks}/{project.totalTasks} tasks · {progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-bacTer)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color }} />
          </div>
        </div>

        {/* Members strip */}
        <div>
          <span className="text-xs font-medium block mb-2" style={{ color: "var(--c-texTer)" }}>Team ({project.members.length})</span>
          <div className="flex flex-wrap gap-2">
            {project.members.map(m => (
              <div key={m.name} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "var(--c-bacTer)" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold" style={{ backgroundColor: m.color + "20", color: m.color }}>{m.avatar}</div>
                <div>
                  <span className="text-xs font-medium" style={{ color: "var(--c-texPri)" }}>{m.name}</span>
                  <span className="text-[10px] ml-1.5" style={{ color: "var(--c-texDis)" }}>{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-col: Tasks + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-3 rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Tasks</h3>
            <button className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}>
              <Plus className="w-3 h-3" /> Add Task
            </button>
          </div>
          <div className="space-y-1">
            {project.tasks.map(t => {
              const si = TASK_STATUS_ICON[t.status];
              const StatusIcon = si.icon;
              return (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--c-bacTer)] cursor-pointer">
                  <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: si.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block" style={{ color: t.status === "done" ? "var(--c-texTer)" : "var(--c-texPri)", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {t.comments > 0 && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--c-texDis)" }}>
                        <MessageSquare className="w-3 h-3" />{t.comments}
                      </span>
                    )}
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                    <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>{t.dueDate}</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold" style={{ backgroundColor: t.assignee.color + "20", color: t.assignee.color }}>{t.assignee.avatar}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--c-texPri)" }}>Milestones</h3>
          <div className="space-y-4">
            {project.milestones.map(ms => (
              <div key={ms.id} className="p-3 rounded-lg" style={{ backgroundColor: "var(--c-bacTer)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: "var(--c-texPri)" }}>{ms.title}</span>
                  <span className="text-[10px]" style={{ color: ms.progress === 100 ? "var(--c-greTexAccPri)" : "var(--c-texDis)" }}>{ms.dueDate}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--c-bacSec)" }}>
                    <div className="h-full rounded-full" style={{ width: `${ms.progress}%`, backgroundColor: ms.progress === 100 ? "var(--c-greTexAccPri)" : project.color }} />
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: "var(--c-texTer)" }}>{ms.progress}%</span>
                </div>
                <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>{ms.tasksDone}/{ms.tasksTotal} tasks complete</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
