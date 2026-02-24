import { Circle } from "lucide-react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/features/EmptyState";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import type { Task } from "@/lib/types";

interface TasksTableBodyProps {
  isLoading: boolean;
  tasks: Task[];
  memberMap: Map<string, string>;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  isToggling: boolean;
  startIndex: number;
}

export function TasksTableBody({ 
  isLoading, 
  tasks, 
  memberMap, 
  onEdit, 
  onToggle, 
  isToggling, 
  startIndex 
}: TasksTableBodyProps) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-10 text-sm" style={{ color: "var(--c-texDis)" }}>
          Loading tasks…
        </TableCell>
      </TableRow>
    );
  }

  if (tasks.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8}>
          <EmptyState icon={<Circle className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No tasks match your filters" />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableBody>
      {tasks.map((task, index) => (
        <TaskTableRow
          key={task.id}
          task={task}
          memberMap={memberMap}
          onEdit={onEdit}
          onToggle={onToggle}
          isToggling={isToggling}
          showDueDate
          showTags
          serialNumber={startIndex + index}
        />
      ))}
    </TableBody>
  );
}