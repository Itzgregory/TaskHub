import { useState, useEffect } from "react";
import { X, Calendar, Flag, Folder } from "lucide-react";
import type { Priority, Task } from "../../lib/types";
import { useStore } from "../../lib/store";
import { useCreateTodo, useUpdateTodo } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { mapTaskToCreateRequest, mapTaskToUpdateRequest } from "@/lib/api/mappers";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  defaultOrgId?: string;
  defaultDueDate?: string;
  onClose: () => void;
}

export function TaskFormModal({ task, defaultProjectId, defaultOrgId, defaultDueDate, onClose }: TaskFormModalProps) {
  const { state } = useStore();
  const { activeOrg } = useAuth();
  const { toast } = useToast();
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();

  const isEditing = !!task;
  const orgId = defaultOrgId || activeOrg?.orgId;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "none");
  const [projectId, setProjectId] = useState<string | undefined>(task?.projectId ?? defaultProjectId);
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDueDate ?? "");
  const [tags, setTags] = useState(task?.tags.join(", ") ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !orgId) return;

    const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);

    try {
      if (isEditing && task) {
        const version = task.version;
        const updateData = mapTaskToUpdateRequest(
          {
            ...task,
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            projectId: projectId || undefined,
            dueDate: dueDate || undefined,
            tags: tagArray,
          },
          version
        );
        await updateMutation.mutateAsync({ id: task.id, data: updateData });
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        const createData = mapTaskToCreateRequest(
          {
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            projectId: projectId || undefined,
            dueDate: dueDate || undefined,
            tags: tagArray,
          },
          orgId
        );
        await createMutation.mutateAsync(createData);
        toast({
          title: "Task created",
          description: "Your new task has been created successfully.",
        });
      }
      onClose();
    } catch (err) {
      toast({
        title: isEditing ? "Update failed" : "Create failed",
        description: err instanceof Error ? err.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7"
            style={{ color: "var(--c-texTer)" }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <Input
            autoFocus
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-base font-medium border-0 bg-transparent shadow-none focus-visible:ring-0"
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
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="th-select pl-7 h-auto py-1.5 border-0 shadow-none focus-visible:ring-0"
                style={{ paddingLeft: "28px" }}
              />
              <Calendar
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                style={{ color: "var(--c-texTer)" }}
              />
            </div>

            {/* Tags */}
            <Input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="th-select h-auto py-1.5 border-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              style={{ color: "var(--c-texSec)" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !orgId || createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
