import { useState } from "react";
import { X, Calendar, Flag, Folder } from "lucide-react";
import type { Priority, Task } from "../../lib/types";
import { actions, useStore } from "../../lib/store";

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "🔴 Urgent" },
  { value: "high", label: "🟠 High" },
  { value: "medium", label: "🟡 Medium" },
  { value: "low", label: "🟢 Low" },
  { value: "none", label: "— None" },
];

interface TaskFormModalProps {
  task?: Task;
  defaultProjectId?: string;
  defaultDueDate?: string;
  onClose: () => void;
}

export function TaskFormModal({ task, defaultProjectId, defaultDueDate, onClose }: TaskFormModalProps) {
  const { state, dispatch } = useStore();
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "none");
  const [projectId, setProjectId] = useState<string | undefined>(task?.projectId ?? defaultProjectId);
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDueDate ?? "");
  const [tags, setTags] = useState(task?.tags.join(", ") ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      projectId: projectId || undefined,
      dueDate: dueDate || undefined,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      status: task?.status ?? ("todo" as const),
    };

    if (isEditing) {
      dispatch(actions.updateTask(task.id, taskData));
    } else {
      dispatch(actions.addTask(taskData));
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content animate-scale-in">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--c-borPri)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>
            {isEditing ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: "var(--c-texTer)" }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <input
            autoFocus
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-base font-medium bg-transparent outline-none border-0"
            style={{ color: "var(--c-texPri)" }}
          />

          {/* Description */}
          <textarea
            placeholder="Add description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full text-sm bg-transparent outline-none resize-none border-0"
            style={{ color: "var(--c-texSec)" }}
          />

          {/* Meta fields */}
          <div
            className="flex flex-wrap gap-2 pt-2"
            style={{ borderTop: "1px solid var(--c-borPri)" }}
          >
            {/* Priority */}
            <div className="relative">
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="th-select pr-7"
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Flag
                className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                style={{ color: "var(--c-texTer)" }}
              />
            </div>

            {/* Project */}
            <div className="relative">
              <select
                value={projectId ?? ""}
                onChange={e => setProjectId(e.target.value || undefined)}
                className="th-select pr-7"
              >
                <option value="">No Project</option>
                {state.projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <Folder
                className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                style={{ color: "var(--c-texTer)" }}
              />
            </div>

            {/* Due Date */}
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="th-select pl-7"
                style={{ paddingLeft: "28px" }}
              />
              <Calendar
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                style={{ color: "var(--c-texTer)" }}
              />
            </div>

            {/* Tags */}
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="th-select"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: "var(--c-texSec)" }}
              onMouseOver={e => {
                e.currentTarget.style.color = "var(--c-texPri)";
                e.currentTarget.style.backgroundColor = "var(--c-bacTer)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.color = "var(--c-texSec)";
                e.currentTarget.style.backgroundColor = "";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
            >
              {isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
