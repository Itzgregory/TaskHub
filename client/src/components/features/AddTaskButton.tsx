import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddTaskButtonProps {
    onClick: () => void;
}

/**
 * The subtle "Add task" button that appears at the bottom of task views.
 * Uses shadcn Button with ghost variant.
 */
export function AddTaskButton({ onClick }: AddTaskButtonProps) {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className="flex items-center gap-2 mt-3 w-full justify-start h-auto py-2 text-sm font-normal"
            style={{ color: "var(--c-texTer)" }}
        >
            <Plus className="w-4 h-4" style={{ color: "var(--c-texDis)" }} />
            Add task
        </Button>
    );
}
