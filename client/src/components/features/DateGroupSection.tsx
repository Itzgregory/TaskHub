import { TaskItem } from "./TaskItem";
import type { Task } from "../../lib/types";

interface DateGroupSectionProps {
    label: string;
    tasks: Task[];
    showProject?: boolean;
    /** Optional opacity override for the task list (e.g. 0.75 for completed) */
    taskOpacity?: number;
}

/**
 * A date-labelled section of tasks — used in Upcoming, Completed, and similar
 * grouped-by-date views. Replaces the identical inline JSX pattern that was
 * duplicated across at least 3 pages.
 */
export function DateGroupSection({
    label,
    tasks,
    showProject = false,
    taskOpacity,
}: DateGroupSectionProps) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <h2
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--c-texSec)" }}
                >
                    {label}
                </h2>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-borPri)" }} />
                <span className="text-xs font-mono" style={{ color: "var(--c-texDis)" }}>
                    {tasks.length}
                </span>
            </div>
            <div className="space-y-0.5" style={taskOpacity ? { opacity: taskOpacity } : undefined}>
                {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} showProject={showProject} />
                ))}
            </div>
        </div>
    );
}
