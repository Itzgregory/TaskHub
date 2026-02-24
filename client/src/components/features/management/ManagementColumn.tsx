import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ManagementColumnProps {
    title: string;
    count: number;
    accent: string;
    children: React.ReactNode;
    onAdd?: () => void;
}

export function ManagementColumn({ title, count, accent, children, onAdd }: ManagementColumnProps) {
    return (
        <div className="flex flex-col flex-1 min-w-0">
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

            <div className="space-y-2 flex-1">
                {children}
            </div>
        </div>
    );
}