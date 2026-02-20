import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2, Circle } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { TaskList } from "../../../components/features/TaskList";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { useStore, actions } from "../../../lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PROJECT_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

export default function ProjectPage() {
  const { projectId } = useParams({ from: "/dashboard/projects/$projectId" });
  const { state, dispatch, getTasksByProject } = useStore();
  const navigate = useNavigate();

  const [addingTask, setAddingTask] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const project = state.projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <AppLayout title="Project not found">
        <p style={{ color: "var(--c-texTer)" }}>This project doesn't exist.</p>
      </AppLayout>
    );
  }

  const tasks = getTasksByProject(project.id);
  const pending = tasks.filter(t => t.status !== "done");
  const done = tasks.filter(t => t.status === "done");

  const startEdit = () => {
    setEditName(project.name);
    setEditColor(project.color);
    setEditingProject(true);
  };

  const saveEdit = () => {
    dispatch(actions.updateProject(project.id, { name: editName, color: editColor }));
    setEditingProject(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${project.name}" and unassign its tasks?`)) {
      dispatch(actions.deleteProject(project.id));
      navigate({ to: "/dashboard/task" });
    }
  };

  return (
    <AppLayout
      title={project.name}
      subtitle={`${pending.length} pending · ${done.length} done`}
    >
      {/* Project header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: project.color + "22" }}
        >
          <Circle className="w-4 h-4" style={{ color: project.color, fill: project.color }} />
        </div>
        <div className="flex-1">
          {editingProject ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingProject(false); }}
                className="text-sm font-semibold bg-transparent border-0 border-b shadow-none focus-visible:ring-0 rounded-none h-auto p-0"
                style={{
                  borderBottom: `1px solid var(--c-bluTexAccPri)`,
                  color: "var(--c-texPri)",
                }}
              />
              <div className="flex gap-1">
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setEditColor(c)}
                    className="w-4 h-4 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: editColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
              <Button
                variant="link"
                onClick={saveEdit}
                className="h-auto p-0 text-xs"
                style={{ color: "var(--c-bluTexAccPri)" }}
              >
                Save
              </Button>
            </div>
          ) : (
            <h2 className="text-base font-semibold" style={{ color: "var(--c-texPri)" }}>
              {project.name}
            </h2>
          )}
          {project.description && (
            <p className="text-xs" style={{ color: "var(--c-texTer)" }}>{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={startEdit}
            className="h-7 w-7"
            style={{ color: "var(--c-texTer)" }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-7 w-7 hover:bg-[var(--c-redBacSec)] hover:text-[var(--c-redTexAccPri)]"
            style={{ color: "var(--c-texTer)" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <TaskList tasks={pending} emptyMessage="No pending tasks" />

      <AddTaskButton onClick={() => setAddingTask(true)} />

      {done.length > 0 && (
        <div className="mt-8">
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-2 px-3"
            style={{ color: "var(--c-texTer)" }}
          >
            Completed ({done.length})
          </h3>
          <div style={{ opacity: 0.6 }}>
            <TaskList tasks={done} />
          </div>
        </div>
      )}

      {addingTask && (
        <TaskFormModal defaultProjectId={project.id} onClose={() => setAddingTask(false)} />
      )}
    </AppLayout>
  );
}
