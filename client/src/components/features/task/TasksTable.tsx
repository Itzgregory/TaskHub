import { Table, TableHeader } from "@/components/ui/table";
import { TasksTableHeader } from "./TasksTableHeader";
import { TasksTableBody } from "./TasksTableBody";
import type { Task } from "@/lib/types";

interface TasksTableProps {
  isLoading: boolean;
  tasks: Task[];
  memberMap: Map<string, string>;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  isToggling: boolean;
  startIndex: number;
}

export function TasksTable({ 
  isLoading, 
  tasks, 
  memberMap, 
  onEdit, 
  onToggle, 
  isToggling, 
  startIndex 
}: TasksTableProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)" }}>
      <Table>
        <TableHeader>
          <TasksTableHeader />
        </TableHeader>
        <TasksTableBody
          isLoading={isLoading}
          tasks={tasks}
          memberMap={memberMap}
          onEdit={onEdit}
          onToggle={onToggle}
          isToggling={isToggling}
          startIndex={startIndex}
        />
      </Table>
    </div>
  );
}