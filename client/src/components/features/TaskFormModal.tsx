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
import { PRIORITY_OPTIONS } from "@/lib/utils/priorityColours";

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
  const [assignedToUserId, setAssignedToUserId] = useState(task?.assignedToUserId ?? "");

  // Validation states
  const [titleTouched, setTitleTouched] = useState(false);
  const [dueDateTouched, setDueDateTouched] = useState(false);
  const [priorityTouched, setPriorityTouched] = useState(false);
  const [assigneeTouched, setAssigneeTouched] = useState(false);
  const [tagsTouched, setTagsTouched] = useState(false);

  // Validation functions
  const isTitleValid = title.trim().length > 0;
  const isDueDateValid = dueDate.trim().length > 0;
  const isPriorityValid = priority !== "none";
  const isAssigneeValid = assignedToUserId.trim().length > 0;
  const isTagsValid = tags.trim().length > 0;

  const isFormValid = isTitleValid && isDueDateValid && isPriorityValid && isAssigneeValid && isTagsValid;

  // Convert between empty string and UNASSIGNED_VALUE for the Select component
  const selectAssigneeValue = assignedToUserId === "" ? UNASSIGNED_VALUE : assignedToUserId;

  const handleAssigneeChange = (value: string) => {
    setAssigneeTouched(true);
    setAssignedToUserId(value === UNASSIGNED_VALUE ? "" : value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    setTitleTouched(true);
    setDueDateTouched(true);
    setPriorityTouched(true);
    setAssigneeTouched(true);
    setTagsTouched(true);

    if (!isFormValid || !orgId) return;

    const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
    const assignee = assignedToUserId || undefined; 

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
            dueDate: dueDate,
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
            dueDate: dueDate,
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
          {/* Title - Required */}
          <div className="space-y-1">
            <Input
              autoFocus
              type="text"
              placeholder="Task title *"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              className={`text-base font-medium border-0 bg-transparent shadow-none focus-visible:ring-0 ${
                titleTouched && !isTitleValid ? "border-l-2 border-red-500 pl-2" : ""
              }`}
              style={{ color: "var(--c-texPri)" }}
            />
            {titleTouched && !isTitleValid && (
              <p className="text-xs text-red-500">Title is required</p>
            )}
          </div>

          {/* Description - Optional */}
          <textarea
            placeholder="Add description... (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full text-sm bg-transparent outline-none resize-none border-0"
            style={{ color: "var(--c-texSec)" }}
          />

          {/* Meta fields */}
          <div
            className="flex flex-wrap items-start gap-2 pt-2"
            style={{ borderTop: "1px solid var(--c-borPri)" }}
          >
            {/* Priority - Required */}
            <div className="relative">
              <Select value={priority} onValueChange={(value: Priority) => {
                setPriority(value);
                setPriorityTouched(true);
              }}>
                <SelectTrigger 
                  className={`w-[130px] h-8 pl-7 ${
                    priorityTouched && !isPriorityValid ? "border-red-500" : ""
                  }`}
                  style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}
                >
                  <SelectValue placeholder="Priority *" />
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

            {/* Assign to Member - Required */}
            {members.length > 0 && (
              <div className="relative">
                <Select value={selectAssigneeValue} onValueChange={handleAssigneeChange}>
                  <SelectTrigger 
                    className={`w-[140px] h-8 pl-7 ${
                      assigneeTouched && !isAssigneeValid ? "border-red-500" : ""
                    }`}
                    style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}
                  >
                    <SelectValue placeholder="Assignee *" />
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

            {/* Due Date - Required */}
            <div className="relative">
              <Input
                type="date"
                value={dueDate}
                onChange={e => {
                  setDueDate(e.target.value);
                  setDueDateTouched(true);
                }}
                onBlur={() => setDueDateTouched(true)}
                className={`h-8 py-1.5 border-0 shadow-none focus-visible:ring-0 ${
                  dueDateTouched && !isDueDateValid ? "border-red-500" : ""
                }`}
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

            {/* Tags - Required */}
            <div className="relative flex-1 min-w-[180px]">
              <Input
                type="text"
                placeholder="Tags * (comma separated)"
                value={tags}
                onChange={e => {
                  setTags(e.target.value);
                  setTagsTouched(true);
                }}
                onBlur={() => setTagsTouched(true)}
                className={`h-8 py-1.5 border-0 shadow-none focus-visible:ring-0 w-full ${
                  tagsTouched && !isTagsValid ? "border-red-500" : ""
                }`}
                style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}
              />
            </div>
          </div>

          {/* Validation summary */}
          {!isFormValid && (titleTouched || dueDateTouched || priorityTouched || assigneeTouched || tagsTouched) && (
            <div className="text-xs text-red-500 mt-2">
              Please fill in all required fields (*)
            </div>
          )}

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
              disabled={!isFormValid || !orgId || createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
              title={!isFormValid ? "All fields except description are required" : ""}
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