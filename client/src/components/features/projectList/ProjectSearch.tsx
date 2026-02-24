import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProjectSearch({ value, onChange }: ProjectSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--c-texDis)" }} />
        <Input
          type="text"
          placeholder="Search projects..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>
    </div>
  );
}