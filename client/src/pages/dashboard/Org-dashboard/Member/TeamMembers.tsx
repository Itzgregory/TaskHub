import { useState } from "react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { TablePagination } from "@/components/features/TablePagination";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers } from "@/lib/api/hooks";
import { usePagination } from "@/lib/hooks/usePagination";
import { useMemberFilters } from "@/components/features/membersList/useMemberFilters";
import { useMemberActions } from "@/lib/hooks/useMemberActions";
import { MemberToolbar } from "@/components/features/membersList/MemberToolbar";
import { MemberTable } from "@/components/features/membersList/MemberTable";
import { InviteMemberDialog } from "@/components/features/membersList/InviteMemberDialog";
import { RemoveMemberDialog } from "@/components/features/membersList/RemoveMemberDialog";
import type { OrgMemberDto, UserRole } from "@/lib/api/types";
import type { UiRole } from "@/lib/utils/org-constants";

export default function TeamMembers() {
  const { activeOrg, user } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UiRole | "all">("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("Member");
  const [removeMember, setRemoveMember] = useState<OrgMemberDto | null>(null);

  const { data, isLoading } = useOrgMembers(activeOrg?.orgId);
  const members = data?.members ?? [];
  
  const filtered = useMemberFilters(members, search, roleFilter);
  
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    paginatedItems,
    goToPage,
    startIndex,
    endIndex,
  } = usePagination({ items: filtered, pageSize: 5 });

  const currentUserRole = members.find(m => m.userId === user?.userId)?.role;
  const isAdmin = currentUserRole === "OrgAdmin";

  const { handleInvite, handleRemove, isAdding, isRemoving } = useMemberActions(activeOrg?.orgId);

  return (
    <AppLayout
      title="Team Members"
      subtitle={activeOrg ? `${members.length} members in ${activeOrg.orgName}` : "Select an organisation to view members"}
    >
      <MemberToolbar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onInviteClick={() => setInviteOpen(true)}
        isAdmin={isAdmin}
        hasOrg={!!activeOrg}
      />

      <MemberTable
        members={filtered}
        paginatedMembers={paginatedItems}
        startIndex={startIndex}
        isLoading={isLoading}
        currentUserId={user?.userId}
        isAdmin={isAdmin}
        onRemoveClick={setRemoveMember}
      />

      {!isLoading && filtered.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startIndex={startIndex}
          endIndex={endIndex}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        orgName={activeOrg?.orgName}
        username={inviteUsername}
        onUsernameChange={setInviteUsername}
        role={inviteRole}
        onRoleChange={setInviteRole}
        onInvite={() => handleInvite(inviteUsername, inviteRole, () => {
          setInviteOpen(false);
          setInviteUsername("");
          setInviteRole("Member");
        })}
        isPending={isAdding}
      />

      <RemoveMemberDialog
        member={removeMember}
        onOpenChange={(open) => !open && setRemoveMember(null)}
        onConfirm={() => removeMember && handleRemove(removeMember, () => setRemoveMember(null))}
        orgName={activeOrg?.orgName}
        isPending={isRemoving}
      />
    </AppLayout>
  );
}