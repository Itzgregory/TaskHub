import { useMemo, useState } from "react";
import { CalendarDays, Calendar, ChevronDown } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { AddTaskButton } from "../../../components/features/AddTaskButton";
import { TaskFormModal } from "../../../components/features/TaskFormModal";
import { EmptyState } from "../../../components/features/EmptyState";
import { TablePagination } from "../../../components/features/TablePagination";
import { TaskTableRow } from "@/components/features/TaskTableRow";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { groupByDueDate, formatRelativeDate, getTodayStr } from "@/lib/utils/tasks";
import { useTaskToggle } from "@/lib/hooks/useTaskToggle";
import { useOrgMemberMap } from "@/lib/hooks/useOrgMemberMap";
import { usePagination } from "@/lib/hooks/usePagination";
import type { Task } from "@/lib/types";

export default function UpcomingPage() {
  const { activeOrg } = useAuth();
  const [addingTask, setAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading } = useTodos({
    orgId: activeOrg?.orgId || "",
    page: 1,
    pageSize: 100,
    status: "Open",
    sortBy: "dueDate",
    ascending: true,
  });

  const memberMap = useOrgMemberMap(activeOrg?.orgId);
  const { toggle, isToggling } = useTaskToggle(activeOrg?.orgId ?? "");

  const tasks = useMemo(() => {
    if (!data?.todos.items || !activeOrg) return [];
    const todayStr = getTodayStr();
    return data.todos.items
      .filter(todo => todo.dueDate && todo.dueDate.split("T")[0] > todayStr)
      .map(todo => mapTodoDtoToTask(todo, activeOrg.orgId));
  }, [data, activeOrg]);

  const grouped = groupByDueDate(tasks);
  const sortedDates = Object.keys(grouped).sort();

  // Set initial selected date to the first date
  useState(() => {
    if (sortedDates.length > 0 && !selectedDate) {
      setSelectedDate(sortedDates[0]);
    }
  });

  const currentTasks = selectedDate ? grouped[selectedDate] || [] : [];
  
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    paginatedItems,
    goToPage,
    startIndex,
    endIndex,
  } = usePagination({
    items: currentTasks,
    pageSize: 5,
  });

  const getDisplayDate = (date: string) => {
    if (date === "no-date") return "No Date";
    return formatRelativeDate(date, "EEEE, MMMM d, yyyy");
  };

  if (!activeOrg) {
    return (
      <AppLayout title="Upcoming" subtitle="Please select an organisation">
        <EmptyState icon={<CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="No organisation selected." />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Upcoming"
      subtitle={isLoading ? "Loading upcoming tasks..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} with future due dates`}
    >
      {sortedDates.length === 0 ? (
        <EmptyState icon={<CalendarDays className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />} title="Nothing upcoming" description="Add tasks with future due dates" />
      ) : (
        <div className="space-y-6">
          {/* Date selector dropdown */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-[300px] justify-between text-sm font-normal"
                    style={{ 
                      backgroundColor: "var(--c-bacEle)", 
                      borderColor: "var(--c-borPri)",
                      color: "var(--c-texPri)" 
                    }}
                  >
                    <span className="truncate">
                      {selectedDate ? getDisplayDate(selectedDate) : "Select a date"}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-[300px] max-h-[400px] overflow-y-auto"
                  style={{ 
                    backgroundColor: "var(--c-bacEle)", 
                    borderColor: "var(--c-borPri)" 
                  }}
                >
                  {sortedDates.map(date => (
                    <DropdownMenuItem
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        goToPage(1);
                      }}
                      className="flex items-center justify-between py-2"
                      style={{
                        backgroundColor: selectedDate === date ? "var(--c-bacTer)" : "transparent",
                      }}
                    >
                      <span className="text-sm" style={{ color: "var(--c-texPri)" }}>
                        {getDisplayDate(date)}
                      </span>
                      <span 
                        className="text-xs px-1.5 py-0.5 rounded-md ml-2"
                        style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}
                      >
                        {grouped[date].length}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Show total count */}
            <span className="text-xs" style={{ color: "var(--c-texTer)" }}>
              {sortedDates.length} date{sortedDates.length !== 1 ? "s" : ""} with tasks
            </span>
          </div>

          {/* Tasks for selected date */}
          {selectedDate && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>
                  {selectedDate === "no-date" ? "No Date" : formatRelativeDate(selectedDate, "EEEE, MMMM d")}
                </h3>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-md" style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}>
                  {grouped[selectedDate].length}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)" }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
                      <TableHead className="w-10 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>S/N</TableHead>
                      <TableHead className="w-8" />
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Assignee</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Tags</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((task, index) => (
                      <TaskTableRow 
                        key={task.id} 
                        task={task} 
                        memberMap={memberMap} 
                        onEdit={setEditingTask} 
                        onToggle={toggle} 
                        isToggling={isToggling} 
                        showDueDate={false} 
                        showTags
                        serialNumber={startIndex + index} 
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination for tasks */}
              {currentTasks.length > 0 && (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={currentTasks.length}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  itemsPerPage={itemsPerPage}
                  onPageChange={goToPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </>
          )}
        </div>
      )}

      <AddTaskButton onClick={() => setAddingTask(true)} />
      {addingTask && <TaskFormModal onClose={() => setAddingTask(false)} />}
      {editingTask && <TaskFormModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </AppLayout>
  );
}