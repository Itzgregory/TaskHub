import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/features/EmptyState";
import { Users } from "lucide-react";
import { MemberTableRow } from "./MemberTableRow";
import type { OrgMemberDto } from "@/lib/api/types";

interface MemberTableProps {
  members: OrgMemberDto[];
  paginatedMembers: OrgMemberDto[];
  startIndex: number;
  isLoading: boolean;
  currentUserId?: string;
  isAdmin: boolean;
  onRemoveClick: (member: OrgMemberDto) => void;
}

export function MemberTable({
  members,
  paginatedMembers,
  startIndex,
  isLoading,
  currentUserId,
  isAdmin,
  onRemoveClick,
}: MemberTableProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)" }}>
      <Table>
        <TableHeader>
          <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
            <TableHead className="w-10 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>S/N</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Member</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Role</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Joined</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Status</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedMembers.map((member, index) => (
            <MemberTableRow
              key={member.userId}
              member={member}
              index={index}
              startIndex={startIndex}
              isSelf={member.userId === currentUserId}
              isAdmin={isAdmin}
              onRemoveClick={onRemoveClick}
            />
          ))}

          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState
                  icon={<Users className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
                  title={isLoading ? "Loading members..." : "No members found"}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}