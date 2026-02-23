import { useToggleTodoStatus } from "@/lib/api/hooks";
import type { Task } from "@/lib/types";
import { useToast } from "./use-toast";

export function useTaskToggle(orgId: string) {
  const { toast } = useToast();
  const toggleMutation = useToggleTodoStatus();

  const toggle = async (task: Task) => {
    try {
      await toggleMutation.mutateAsync({
        id: task.id,
        data: { id: task.id, orgId, expectedVersion: task.version },
      });
    } catch (err) {
      toast({
        title: "Failed to update task",
        description: err instanceof Error ? err.message : "An error occurred.",
        variant: "destructive",
      });
    }
  };

  return { toggle, isToggling: toggleMutation.isPending };
}