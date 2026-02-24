import { useState } from "react";
import { Plus, ArrowRight, ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { useTodos, useToggleTodoStatus, useOrgMembers } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { TaskFormModal } from "@/components/features/TaskFormModal";
import { getTodayStr } from "@/lib/utils/tasks";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import type { Task } from "@/lib/types";
import { getInitials } from "@/lib/utils/getInitials";
import { PRIORITY_COLOR } from "@/lib/utils/priorityColours";


interface ManagementCardProps {
    task: Task;
    orgId: string;
    assigneeName: string | null;
    onMove: () => void;
    isMoving: boolean;
    direction: "right" | "left";
}

function ManagementCard({ task, assigneeName, onMove, isMoving, direction }: ManagementCardProps) {
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
            {/* Title */}
            <p className="text-sm font-medium leading-snug" style={{ color: "var(--c-texPri)" }}>
                {task.title}
            </p>

            {/* Description (truncated) */}
            {task.description && (
                <p className="text-xs line-clamp-1" style={{ color: "var(--c-texTer)" }}>
                    {task.description}
                </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Priority dot */}
                {task.priority !== "none" && (
                    <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PRIORITY_COLOR[task.priority] }}
                        title={task.priority}
                    />
                )}

                {/* Due date */}
                {task.dueDate && (
                    <span
                        className="flex items-center gap-0.5 text-[11px] font-medium"
                        style={{ color: overdue ? "var(--c-redTexSec)" : "var(--c-texTer)" }}
                    >
                        {overdue
                            ? <AlertCircle className="w-3 h-3" />
                            : <Calendar className="w-3 h-3" />}
                        {task.dueDate}
                    </span>
                )}

                {/* Tags */}
                {task.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[11px]" style={{ color: "var(--c-texDis)" }}>
                        #{tag}
                    </span>
                ))}

                {/* Assignee */}
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

            {/* Move button */}
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

// ── ManagementColumn ──────────────────────────────────────────────────────────────

interface ManagementColumnProps {
    title: string;
    count: number;
    accent: string;
    children: React.ReactNode;
    onAdd?: () => void;
}

function ManagementColumn({ title, count, accent, children, onAdd }: ManagementColumnProps) {
    return (
        <div className="flex flex-col flex-1 min-w-0">
            {/* Column header */}
            <div
                className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-3"
                style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
            >
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: accent }}
                    />
                    <span className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>{title}</span>
                    <span
                        className="text-xs font-mono px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}
                    >
                        {count}
                    </span>
                </div>
                {onAdd && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onAdd}
                        title="Add task"
                        style={{ color: "var(--c-texTer)" }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>

            {/* Cards */}
            <div className="space-y-2 flex-1">
                {children}
            </div>
        </div>
    );
}

// ── ManagementBoard ───────────────────────────────────────────────────────────────

interface ManagementBoardProps {
    orgId: string;
}

export function ManagementBoard({ orgId }: ManagementBoardProps) {
    const { toast } = useToast();
    const toggleMutation = useToggleTodoStatus();
    const [addingTask, setAddingTask] = useState(false);

    const { data: openData, isLoading: loadingOpen } = useTodos({
        orgId,
        status: "Open",
        pageSize: 50,
    });

    const { data: doneData, isLoading: loadingDone } = useTodos({
        orgId,
        status: "Done",
        pageSize: 50,
    });

    const { data: membersData } = useOrgMembers(orgId);
    const memberMap = new Map(membersData?.members.map(m => [m.userId, m.username]) ?? []);

    const openTasks = (openData?.todos.items ?? []).map(dto => mapTodoDtoToTask(dto, orgId));
    const doneTasks = (doneData?.todos.items ?? []).map(dto => mapTodoDtoToTask(dto, orgId));

    const handleMove = async (task: Task) => {
        try {
            await toggleMutation.mutateAsync({
                id: task.id,
                data: { id: task.id, orgId, expectedVersion: task.version },
            });
        } catch (err) {
            toast({
                title: "Failed to move task",
                description: err instanceof Error ? err.message : "An error occurred.",
                variant: "destructive",
            });
        }
    };

    const isLoading = loadingOpen || loadingDone;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <span className="text-sm" style={{ color: "var(--c-texTer)" }}>Loading board…</span>
            </div>
        );
    }

    return (
        <>
            <div className="flex gap-4 items-start overflow-x-auto pb-4">
                {/* ── Open column ─────────────────────────────────── */}
                <ManagementColumn
                    title="Open"
                    count={openData?.todos.totalCount ?? openTasks.length}
                    accent="var(--c-bluTexAccPri)"
                    onAdd={() => setAddingTask(true)}
                >
                    {openTasks.length === 0 ? (
                        <p className="text-xs text-center py-6" style={{ color: "var(--c-texDis)" }}>
                            No open tasks. Click + to create one.
                        </p>
                    ) : (
                        openTasks.map(task => (
                            <ManagementCard
                                key={task.id}
                                task={task}
                                orgId={orgId}
                                assigneeName={task.assignedToUserId ? (memberMap.get(task.assignedToUserId) ?? task.assignedToUserId.slice(0, 8)) : null}
                                onMove={() => handleMove(task)}
                                isMoving={toggleMutation.isPending}
                                direction="right"
                            />
                        ))
                    )}
                </ManagementColumn>

                {/* Divider */}
                <div
                    className="w-px self-stretch flex-shrink-0 hidden sm:block"
                    style={{ backgroundColor: "var(--c-borPri)" }}
                />

                {/* ── Done column ──────────────────────────────────── */}
                <ManagementColumn
                    title="Done"
                    count={doneData?.todos.totalCount ?? doneTasks.length}
                    accent="var(--c-greTexAccPri)"
                >
                    {doneTasks.length === 0 ? (
                        <p className="text-xs text-center py-6" style={{ color: "var(--c-texDis)" }}>
                            No completed tasks yet.
                        </p>
                    ) : (
                        doneTasks.map(task => (
                            <ManagementCard
                                key={task.id}
                                task={task}
                                orgId={orgId}
                                assigneeName={task.assignedToUserId ? (memberMap.get(task.assignedToUserId) ?? task.assignedToUserId.slice(0, 8)) : null}
                                onMove={() => handleMove(task)}
                                isMoving={toggleMutation.isPending}
                                direction="left"
                            />
                        ))
                    )}
                </ManagementColumn>
            </div>

            {addingTask && (
                <TaskFormModal
                    defaultOrgId={orgId}
                    onClose={() => setAddingTask(false)}
                />
            )}
        </>
    );
}
