import { useState, useMemo } from "react";
import { Search, CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Task } from "@/lib/types";
import { PRIORITY_COLOR } from "@/lib/utils/priorityColours";

interface MemberTaskListProps {
  tasks: Task[];
  today: string;
}

export function MemberTaskList({ tasks, today }: MemberTaskListProps) {
  const [taskSearch, setTaskSearch] = useState("");

  const filteredTasks = useMemo(() => {
    if (!taskSearch.trim()) return tasks;
    
    const searchLower = taskSearch.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [tasks, taskSearch]);

  return (
    <div
      className="lg:col-span-3 rounded-xl p-5 flex flex-col h-[500px]"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>
          Assigned Tasks ({filteredTasks.length})
        </h3>
      </div>

      {/* Task search */}
      <div className="relative mb-3 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={taskSearch}
          onChange={(e) => setTaskSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
          style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-borPri)" }}
        />
      </div>

      {/* Scrollable task list */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: "var(--c-texDis)" }}>
              {taskSearch ? "No tasks match your search" : "No tasks assigned to this member."}
            </p>
          </div>
        ) : (
          filteredTasks.map(t => {
            const isDone = t.status === "done";
            const overdue = t.dueDate && t.dueDate < today && !isDone;
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--c-bacTer)]"
              >
                {isDone
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-greTexAccPri)" }} />
                  : overdue
                    ? <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-redTexAccPri)" }} />
                    : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--c-texDis)" }} />
                }
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm font-medium truncate block"
                    style={{
                      color: isDone ? "var(--c-texTer)" : "var(--c-texPri)",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {t.priority !== "none" && (
                    <span className="text-[10px] font-medium capitalize" style={{ color: PRIORITY_COLOR[t.priority] }}>
                      {t.priority}
                    </span>
                  )}
                  {t.dueDate && (
                    <span
                      className="flex items-center gap-0.5 text-[10px]"
                      style={{ color: overdue ? "var(--c-redTexSec)" : "var(--c-texDis)" }}
                    >
                      <Clock className="w-3 h-3" />
                      {t.dueDate}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}