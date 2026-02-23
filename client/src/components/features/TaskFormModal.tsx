import { useState } from "react";
import { X, Calendar, Flag, User } from "lucide-react";
import type { Priority, Task } from "../../lib/types";
import { useCreateTodo, useUpdateTodo, useOrgMembers } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { mapTaskToCreateRequest, mapTaskToUpdateRequest } from "@/lib/api/mappers";
import { useToast } from "@/lib/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "🔴 Urgent" },
  { value: "high", label: "🟠 High" },
  { value: "medium", label: "🟡 Medium" },
  { value: "low", label: "🟢 Low" },
  { value: "none", label: "— None" },
];

// Use a special value for unassigned that's not an empty string
const UNASSIGNED_VALUE = "unassigned";

interface TaskFormModalProps {
  task?: Task;
  defaultProjectId?: string;
  defaultOrgId?: string;
  defaultDueDate?: string;
  onClose: () => void;
}

export function TaskFormModal({ task, defaultProjectId, defaultOrgId, defaultDueDate, onClose }: TaskFormModalProps) {
  const { activeOrg } = useAuth();
  const { toast } = useToast();
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();

  const isEditing = !!task;
  const orgId = defaultOrgId || activeOrg?.orgId;

  const { data: membersData } = useOrgMembers(orgId);
  const members = membersData?.members ?? [];

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "none");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDueDate ?? "");
  const [tags, setTags] = useState(task?.tags.join(", ") ?? "");
  // Store as empty string for unassigned in state, but use special value for select
  const [assignedToUserId, setAssignedToUserId] = useState(task?.assignedToUserId ?? "");

  // Convert between empty string and UNASSIGNED_VALUE for the Select component
  const selectAssigneeValue = assignedToUserId === "" ? UNASSIGNED_VALUE : assignedToUserId;

  const handleAssigneeChange = (value: string) => {
    // Convert UNASSIGNED_VALUE back to empty string for the actual state
    setAssignedToUserId(value === UNASSIGNED_VALUE ? "" : value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !orgId) return;

    const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
    const assignee = assignedToUserId || undefined; // Empty string becomes undefined

    try {
      if (isEditing && task) {
        const version = task.version;
        const updateData = mapTaskToUpdateRequest(
          {
            ...task,
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            projectId: task.projectId ?? orgId,
            dueDate: dueDate || undefined,
            tags: tagArray,
            assignedToUserId: assignee,
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
            projectId: defaultProjectId,
            dueDate: dueDate || undefined,
            tags: tagArray,
            assignedToUserId: assignee,
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
            className="flex flex-wrap items-center gap-2 pt-2"
            style={{ borderTop: "1px solid var(--c-borPri)" }}
          >
            {/* Priority */}
            <div className="relative">
              <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                <SelectTrigger 
                  className="w-[130px] h-8 pl-7"
                  style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}
                >
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
                  {PRIORITY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Flag
                className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                style={{ color: "var(--c-texTer)" }}
              />
            </div>

            {/* Assign to Member */}
            {members.length > 0 && (
              <div className="relative">
                <Select value={selectAssigneeValue} onValueChange={handleAssigneeChange}>
                  <SelectTrigger 
                    className="w-[140px] h-8 pl-7"
                    style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}
                  >
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
                    <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <User
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                  style={{ color: "var(--c-texTer)" }}
                />
              </div>
            )}

            {/* Due Date */}
            <div className="relative">
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="h-8 py-1.5 border-0 shadow-none focus-visible:ring-0"
                style={{ 
                  backgroundColor: "var(--c-bacEle)", 
                  borderColor: "var(--c-borPri)",
                  paddingLeft: "28px",
                  width: "180px"
                }}
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
              className="h-8 py-1.5 border-0 shadow-none focus-visible:ring-0 flex-1 min-w-[180px]"
              style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}
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