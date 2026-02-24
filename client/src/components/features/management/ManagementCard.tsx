import { Calendar, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils/getInitials";
import { PRIORITY_COLOR } from "@/lib/utils/priorityColours";
import { getTodayStr } from "@/lib/utils/tasks";
import type { Task } from "@/lib/types";

interface ManagementCardProps {
    task: Task;
    assigneeName: string | null;
    onMove: () => void;
    isMoving: boolean;
    direction: "right" | "left";
}

export function ManagementCard({ task, assigneeName, onMove, isMoving, direction }: ManagementCardProps) {
    const today = getTodayStr();
    const overdue = task.dueDate && task.dueDate < today && task.status !== "done";

    return (
        <div
            className="rounded-xl p-3 space-y-2 group"
            style={{
                backgroundColor: "var(--c-bacPri)",
                border: "1px solid var(--c-borPri)",
                boxShadow: "var(--c-shaSM)",
            }}
        >
            <p className="text-sm font-medium leading-snug" style={{ color: "var(--c-texPri)" }}>
                {task.title}
            </p>

            {task.description && (
                <p className="text-xs line-clamp-1" style={{ color: "var(--c-texTer)" }}>
                    {task.description}
                </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                {task.priority !== "none" && (
                    <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}
                        title={task.priority}
                    />
                )}

                {task.dueDate && (
                    <span
                        className="flex items-center gap-0.5 text-[11px] font-medium"
                        style={{ color: overdue ? "var(--c-redTexSec)" : "var(--c-texTer)" }}
                    >
                        {overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                        {task.dueDate}
                    </span>
                )}

                {task.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[11px]" style={{ color: "var(--c-texDis)" }}>
                        #{tag}
                    </span>
                ))}

                {assigneeName && (
                    <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold flex-shrink-0 ml-auto"
                        title={`Assigned to ${assigneeName}`}
                        style={{
                            backgroundColor: "var(--c-bluBacSec)",
                            color: "var(--c-bluTexAccPri)",
                            border: "1px solid var(--c-bluTexAccPri)",
                        }}
                    >
                        {getInitials(assigneeName)}
                    </span>
                )}
            </div>

            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMove}
                    disabled={isMoving}
                    className="h-6 px-2 text-[11px] gap-1"
                    style={{ color: "var(--c-texTer)" }}
                >
                    {direction === "right"
                        ? <><ArrowRight className="w-3 h-3" /> Mark Done</>
                        : <><ArrowLeft className="w-3 h-3" /> Reopen</>}
                </Button>
            </div>
        </div>
    );
}