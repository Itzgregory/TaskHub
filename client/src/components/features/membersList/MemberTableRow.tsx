import { Users, UserMinus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrgMemberDto } from "@/lib/api/types";
import { ROLE_META, type UiRole } from "@/lib/utils/org-constants";
import { TableCell, TableRow } from "@/components/ui/table";

interface MemberTableRowProps {
  member: OrgMemberDto;
  index: number;
  startIndex: number;
  isSelf: boolean;
  isAdmin: boolean;
  onRemoveClick: (member: OrgMemberDto) => void;
}

function mapRoleToUi(role: OrgMemberDto['role']): UiRole {
  return role === "OrgAdmin" ? "admin" : "member";
}

export function MemberTableRow({ 
  member, 
  index, 
  startIndex, 
  isSelf, 
  isAdmin, 
  onRemoveClick 
}: MemberTableRowProps) {
  const uiRole = mapRoleToUi(member.role);
  const roleMeta = ROLE_META[uiRole];
  const RoleIcon = roleMeta.icon;

  return (
    <TableRow
      style={{ backgroundColor: "var(--c-bacSec)", borderColor: "var(--c-borPri)" }}
      className="hover:bg-[var(--c-bacTer)]"
    >
      <TableCell>
        <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{startIndex + index}</span>
      </TableCell>

      <TableCell>
        <Link
          to="/dashboard/org/members/$memberId"
          params={{ memberId: member.userId }}
          className="flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
          >
            {member.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>
              {member.username}
              {isSelf && <span className="text-xs ml-1" style={{ color: "var(--c-texTer)" }}>(you)</span>}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--c-texTer)" }}>
              {uiRole === "admin" ? "Org Admin" : "Member"}
            </p>
          </div>
        </Link>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1.5">
          <RoleIcon className="w-3.5 h-3.5" style={{ color: roleMeta.color }} />
          <span className="text-xs font-medium" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
        </div>
      </TableCell>

      <TableCell>
        <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>
          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "—"}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--c-greTexAccPri)" }} />
          <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Active</span>
        </div>
      </TableCell>

      <TableCell className="text-right">
        {isAdmin && !isSelf ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions for ${member.username}`}>
                <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/org/members/$memberId" params={{ memberId: member.userId }}>
                  <Users className="w-3.5 h-3.5 mr-2" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRemoveClick(member)}
                className="text-red-600 focus:text-red-600"
              >
                <UserMinus className="w-3.5 h-3.5 mr-2" /> Remove from org
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="text-xs" style={{ color: "var(--c-texDis)" }}>
            {isSelf ? "—" : ""}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}