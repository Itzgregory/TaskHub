import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export function ExportButton({ onExport, disabled }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onExport}
      disabled={disabled}
      className="w-full flex items-center justify-start gap-3 h-auto py-3 px-4"
      style={{
        borderColor: "var(--c-borPri)",
        backgroundColor: "var(--c-bacSec)",
        color: "var(--c-texPri)",
      }}
    >
      <Download className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
      <div className="text-left">
        <div className="text-sm font-medium">Export Data</div>
        <div className="text-xs" style={{ color: "var(--c-texTer)" }}>
          Download all tasks as JSON
        </div>
      </div>
    </Button>
  );
}