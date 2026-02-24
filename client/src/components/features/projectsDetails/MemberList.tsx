import { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { getInitials } from "@/lib/utils/getInitials";
import type { OrgMemberDto } from "@/lib/api/types";
import type { Task } from "@/lib/types";

interface MemberListProps {
  members: OrgMemberDto[];
  openTasks: Task[];
  onSearchChange?: (value: string) => void;
}

export function MemberList({ members, openTasks }: MemberListProps) {
  const [memberSearch, setMemberSearch] = useState("");

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    
    const searchLower = memberSearch.toLowerCase();
    return members.filter(member => 
      member.username.toLowerCase().includes(searchLower)
    );
  }, [members, memberSearch]);

  return (
    <div
      className="lg:col-span-2 rounded-xl p-5 flex flex-col h-[600px]"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <h3 className="text-sm font-semibold mb-4 flex-shrink-0" style={{ color: "var(--c-texPri)" }}>
        Members ({filteredMembers.length})
      </h3>

      <div className="relative mb-3 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
        <Input
          type="text"
          placeholder="Search members..."
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
          style={{ backgroundColor: "var(--c-bacTer)", borderColor: "var(--c-borPri)" }}
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2">
        {filteredMembers.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: "var(--c-texDis)" }}>
            {memberSearch ? "No members match your search" : "No members found."}
          </p>
        ) : (
          filteredMembers.map(m => {
            const memberOpenCount = openTasks.filter(t => t.assignedToUserId === m.userId).length;
            return (
              <MemberListItem
                key={m.userId}
                member={m}
                openTaskCount={memberOpenCount}
              />
            );
          })
        )}
      </div>

      <Link
        to="/dashboard/org/members"
        className="mt-4 flex items-center gap-1.5 text-xs hover:underline flex-shrink-0"
        style={{ color: "var(--c-bluTexAccPri)" }}
      >
        <Users className="w-3.5 h-3.5" /> Manage team members
      </Link>
    </div>
  );
}

interface MemberListItemProps {
  member: OrgMemberDto;
  openTaskCount: number;
}

function MemberListItem({ member, openTaskCount }: MemberListItemProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
      style={{ backgroundColor: "var(--c-bacTer)" }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
      >
        {getInitials(member.username)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>
          {member.username}
        </p>
        <p className="text-[10px]" style={{ color: "var(--c-texTer)" }}>
          {member.role === "OrgAdmin" ? "Admin" : "Member"}
        </p>
      </div>
      {openTaskCount > 0 && (
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
        >
          {openTaskCount} open
        </span>
      )}
    </div>
  );
}