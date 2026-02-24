import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import type { Task } from "@/lib/types";

interface CompletedTasksTableProps {
  tasks: Task[];
  memberMap: Map<string, string>;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  isToggling: boolean;
  startIndex: number;
}

export function CompletedTasksTable({ 
  tasks, 
  memberMap, 
  onEdit, 
  onToggle, 
  isToggling, 
  startIndex 
}: CompletedTasksTableProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)", opacity: 0.8 }}>
      <Table>
        <TableHeader>
          <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
            <TableHead className="w-10 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>S/N</TableHead>
            <TableHead className="w-8" />
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Due Date</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Assignee</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
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
              showTags={false}
              serialNumber={startIndex + index} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}