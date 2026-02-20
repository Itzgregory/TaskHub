import { useMemo, useState } from "react";
import {
  Users, Search, Plus, MoreHorizontal, ShieldCheck, UserMinus, ArrowUpDown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { EmptyState } from "@/components/features/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers, useAddMember, useRemoveMember, useChangeRole } from "@/lib/api/hooks";
import type { OrgMemberDto, UserRole } from "@/lib/api/types";
import { ROLE_META, type UiRole } from "@/lib/utils/org-constants";
import { useToast } from "@/hooks/use-toast";

function mapRoleToUi(role: UserRole): UiRole {
  return role === "OrgAdmin" ? "admin" : "member";
}

export default function TeamMembers() {
  const { activeOrg, user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UiRole | "all">("all");

  // Dialogs
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("Member");

  const [removeMember, setRemoveMember] = useState<OrgMemberDto | null>(null);

  // API hooks
  const { data, isLoading } = useOrgMembers(activeOrg?.orgId);
  const addMemberMutation = useAddMember();
  const removeMemberMutation = useRemoveMember();
  const changeRoleMutation = useChangeRole();

  const members = useMemo<OrgMemberDto[]>(
    () => data?.members ?? [],
    [data]
  );

  const filtered = useMemo(() => {
    return members.filter(m => {
      const uiRole = mapRoleToUi(m.role);
      if (roleFilter !== "all" && uiRole !== roleFilter) return false;
      if (search && !m.username.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [members, roleFilter, search]);

  // Current user's role in this org
  const currentUserRole = members.find(m => m.userId === user?.userId)?.role;
  const isAdmin = currentUserRole === "OrgAdmin";

  // --- Handlers ---

  const handleInvite = async () => {
    if (!activeOrg?.orgId || !inviteUsername.trim()) return;

    try {
      await addMemberMutation.mutateAsync({
        orgId: activeOrg.orgId,
        data: { orgId: activeOrg.orgId, username: inviteUsername.trim(), role: inviteRole },
      });
      toast({ title: "Member added", description: `${inviteUsername.trim()} has been added as ${inviteRole}.` });
      setInviteOpen(false);
      setInviteUsername("");
      setInviteRole("Member");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string })?.message || "Failed to add member.";
      toast({ title: "Invite failed", description: message, variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!activeOrg?.orgId || !removeMember) return;

    try {
      await removeMemberMutation.mutateAsync({
        orgId: activeOrg.orgId,
        userId: removeMember.userId,
      });
      toast({ title: "Member removed", description: `${removeMember.username} has been removed from the organisation.` });
      setRemoveMember(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string })?.message || "Failed to remove member.";
      toast({ title: "Remove failed", description: message, variant: "destructive" });
    }
  };

  const handleChangeRole = async (member: OrgMemberDto) => {
    if (!activeOrg?.orgId) return;
    const newRole: UserRole = member.role === "OrgAdmin" ? "Member" : "OrgAdmin";

    try {
      await changeRoleMutation.mutateAsync({
        orgId: activeOrg.orgId,
        userId: member.userId,
        data: { orgId: activeOrg.orgId, userId: member.userId, role: newRole },
      });
      toast({
        title: "Role updated",
        description: `${member.username} is now ${newRole === "OrgAdmin" ? "an Admin" : "a Member"}.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message
        : (err as { message?: string })?.message || "Failed to change role.";
      toast({ title: "Role change failed", description: message, variant: "destructive" });
    }
  };

  return (
    <AppLayout
      title="Team Members"
      subtitle={
        activeOrg
          ? `${members.length} members in ${activeOrg.orgName}`
          : "Select an organisation to view members"
      }
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--c-texDis)" }} />
          <Input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UiRole | "all")}
            className="th-select"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
          <Button
            disabled={!activeOrg || !isAdmin}
            onClick={() => setInviteOpen(true)}
            style={{
              backgroundColor: "var(--c-bluTexAccPri)",
              color: "var(--c-bacPri)",
              opacity: activeOrg && isAdmin ? 1 : 0.5,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>
      </div>

      {/* Members table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-borPri)" }}>
        {/* Header */}
        <div
          className="hidden md:grid grid-cols-12 gap-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
          style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}
        >
          <div className="col-span-4">Member</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Last Active</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* Rows */}
        {filtered.map(m => {
          const uiRole = mapRoleToUi(m.role);
          const roleMeta = ROLE_META[uiRole];
          const RoleIcon = roleMeta.icon;
          const isSelf = m.userId === user?.userId;
          return (
            <div
              key={m.userId}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 items-center transition-colors hover:bg-[var(--c-bacTer)]"
              style={{ borderTop: "1px solid var(--c-borPri)", backgroundColor: "var(--c-bacSec)" }}
            >
              {/* Member */}
              <Link
                to="/dashboard/org/members/$memberId"
                params={{ memberId: m.userId }}
                className="md:col-span-4 flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                >
                  {m.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>
                    {m.username}{isSelf && <span className="text-xs ml-1" style={{ color: "var(--c-texTer)" }}>(you)</span>}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--c-texTer)" }}>{uiRole === "admin" ? "Org Admin" : "Member"}</p>
                </div>
              </Link>

              {/* Role */}
              <div className="md:col-span-2 flex items-center gap-1.5">
                <RoleIcon className="w-3.5 h-3.5" style={{ color: roleMeta.color }} />
                <span className="text-xs font-medium" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
              </div>

              {/* Joined */}
              <div className="md:col-span-2">
                <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>
                  {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                </span>
              </div>

              {/* Status */}
              <div className="md:col-span-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--c-greTexAccPri)" }} />
                <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Active</span>
              </div>

              {/* Last Active */}
              <div className="md:col-span-2">
                <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>—</span>
              </div>

              {/* Actions */}
              <div className="md:col-span-1 flex items-center justify-end gap-2">
                {isAdmin && !isSelf ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions for ${m.username}`}>
                        <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleChangeRole(m)}>
                        {m.role === "OrgAdmin" ? (
                          <><ArrowUpDown className="w-3.5 h-3.5 mr-2" /> Demote to Member</>
                        ) : (
                          <><ShieldCheck className="w-3.5 h-3.5 mr-2" /> Promote to Admin</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setRemoveMember(m)}
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
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            icon={<Users className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
            title={isLoading ? "Loading members..." : "No members found"}
          />
        )}
      </div>

      {/* ---- Invite Dialog ---- */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--c-texPri)" }}>Invite a member</DialogTitle>
            <DialogDescription style={{ color: "var(--c-texSec)" }}>
              Enter the email of an existing user to add them to <strong>{activeOrg?.orgName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-username" style={{ color: "var(--c-texPri)" }}>Username</Label>
              <Input
                id="invite-username"
                type="text"
                placeholder="john_doe"
                value={inviteUsername}
                onChange={e => setInviteUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role" style={{ color: "var(--c-texPri)" }}>Role</Label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as UserRole)}
                className="th-select w-full"
              >
                <option value="Member">Member</option>
                <option value="OrgAdmin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteUsername.trim() || addMemberMutation.isPending}
              style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "#fff" }}
            >
              {addMemberMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Remove Confirmation ---- */}
      <AlertDialog open={!!removeMember} onOpenChange={(open) => { if (!open) setRemoveMember(null); }}>
        <AlertDialogContent style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "var(--c-texPri)" }}>Remove member?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "var(--c-texSec)" }}>
              This will remove <strong>{removeMember?.username}</strong> from <strong>{activeOrg?.orgName}</strong>.
              They will lose access to all todos in this organisation. This action can be undone by re-inviting them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              style={{ backgroundColor: "var(--c-redTexAccPri)", color: "#fff" }}
            >
              {removeMemberMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
