import { useState } from "react";
import { useTodos, useToggleTodoStatus, useOrgMembers } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { useToast } from "@/lib/hooks/use-toast";
import type { Task } from "@/lib/types";

export function useManagementBoard(orgId: string) {
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

    const getAssigneeName = (task: Task) => {
        if (!task.assignedToUserId) return null;
        return memberMap.get(task.assignedToUserId) ?? task.assignedToUserId.slice(0, 8);
    };

    return {
        openTasks,
        doneTasks,
        openCount: openData?.todos.totalCount ?? openTasks.length,
        doneCount: doneData?.todos.totalCount ?? doneTasks.length,
        isLoading: loadingOpen || loadingDone,
        isMoving: toggleMutation.isPending,
        addingTask,
        setAddingTask,
        handleMove,
        getAssigneeName,
    };
}