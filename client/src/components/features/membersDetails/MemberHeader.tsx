import { Calendar, Users, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils/getInitials";
import type { OrgMemberDto } from "@/lib/api/types";
import { ROLE_META } from "@/lib/utils/org-constants";

interface MemberHeaderProps {
  member: OrgMemberDto;
  isSelf: boolean;
  orgName?: string;
}

export function MemberHeader({ member, isSelf, orgName }: MemberHeaderProps) {
  const uiRole = member.role === "OrgAdmin" ? "admin" : "member";
  const roleMeta = ROLE_META[uiRole];
  const RoleIcon = roleMeta.icon;

  return (
    <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
        >
          {getInitials(member.username)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold" style={{ color: "var(--c-texPri)" }}>
              {member.username}
              {isSelf && <span className="text-sm ml-1" style={{ color: "var(--c-texTer)" }}>(you)</span>}
            </h2>
            <span
              className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--c-bluBacSec)", color: roleMeta.color }}
            >
              <RoleIcon className="w-3 h-3" />{roleMeta.label}
            </span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--c-greTexAccPri)" }} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--c-texTer)" }}>
            {member.joinedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {orgName}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 self-start">
          <MoreHorizontal className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
        </Button>
      </div>
    </div>
  );
}