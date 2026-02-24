import { ManagementColumn } from "@/components/features/management/ManagementColumn";
import { ManagementCard } from "@/components/features/management/ManagementCard";
import { ColumnDivider } from "@/components/features/management/ColumnDivider";
import { ManagementLoading } from "@/components/features/management/ManagementLoading";
import { TaskFormModal } from "@/components/features/TaskFormModal";
import { useManagementBoard } from "@/lib/hooks/useManagementBoard";

interface ManagementBoardProps {
    orgId: string;
}

export function ManagementBoard({ orgId }: ManagementBoardProps) {
    const {
        openTasks,
        doneTasks,
        openCount,
        doneCount,
        isLoading,
        isMoving,
        addingTask,
        setAddingTask,
        handleMove,
        getAssigneeName,
    } = useManagementBoard(orgId);

    if (isLoading) {
        return <ManagementLoading />;
    }

    return (
        <>
            <div className="flex gap-4 items-start overflow-x-auto pb-4">
                {/* Open column */}
                <ManagementColumn
                    title="Open"
                    count={openCount}
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
                                assigneeName={getAssigneeName(task)}
                                onMove={() => handleMove(task)}
                                isMoving={isMoving}
                                direction="right"
                            />
                        ))
                    )}
                </ManagementColumn>

                <ColumnDivider />

                {/* Done column */}
                <ManagementColumn
                    title="Done"
                    count={doneCount}
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
                                assigneeName={getAssigneeName(task)}
                                onMove={() => handleMove(task)}
                                isMoving={isMoving}
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