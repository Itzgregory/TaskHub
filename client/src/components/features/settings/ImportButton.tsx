import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportButtonProps {
  onImport: () => void;
  disabled?: boolean;
}

export function ImportButton({ onImport, disabled }: ImportButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onImport}
      disabled={disabled}
      className="w-full flex items-center justify-start gap-3 h-auto py-3 px-4"
      style={{
        borderColor: "var(--c-borPri)",
        backgroundColor: "var(--c-bacSec)",
        color: "var(--c-texPri)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Upload className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
      <div className="text-left">
        <div className="text-sm font-medium">Import Data</div>
        <div className="text-xs" style={{ color: "var(--c-texTer)" }}>
          Upload a JSON or CSV file to import tasks
        </div>
      </div>
    </Button>
  );
}