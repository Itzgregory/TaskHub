import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UiRole } from "@/lib/utils/org-constants";

interface MemberToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: UiRole | "all";
  onRoleFilterChange: (value: UiRole | "all") => void;
  onInviteClick: () => void;
  isAdmin: boolean;
  hasOrg: boolean;
}

export function MemberToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onInviteClick,
  isAdmin,
  hasOrg,
}: MemberToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--c-texDis)" }} />
        <Input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger 
            className="w-[130px] h-9" 
            style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}
          >
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>

        <Button
          disabled={!hasOrg || !isAdmin}
          onClick={onInviteClick}
          style={{
            backgroundColor: "var(--c-bluTexAccPri)",
            color: "var(--c-bacPri)",
            opacity: hasOrg && isAdmin ? 1 : 0.5,
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Invite</span>
        </Button>
      </div>
    </div>
  );
}