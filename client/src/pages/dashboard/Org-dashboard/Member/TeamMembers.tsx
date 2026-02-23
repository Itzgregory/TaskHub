import { useMemo, useState } from "react";
import {
  Users, Search, Plus, UserMinus, MoreHorizontal,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers, useAddMember, useRemoveMember, useChangeRole } from "@/lib/api/hooks";
import type { OrgMemberDto, UserRole } from "@/lib/api/types";
import { ROLE_META, type UiRole } from "@/lib/utils/org-constants";
import { useToast } from "@/lib/hooks/use-toast";

function mapRoleToUi(role: UserRole): UiRole {
  return role === "OrgAdmin" ? "admin" : "member";
}

export default function TeamMembers() {
  const { activeOrg, user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UiRole | "all">("all");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("Member");
  const [removeMember, setRemoveMember] = useState<OrgMemberDto | null>(null);

  const { data, isLoading } = useOrgMembers(activeOrg?.orgId);
  const addMemberMutation = useAddMember();
  const removeMemberMutation = useRemoveMember();
  const changeRoleMutation = useChangeRole();

  const members = useMemo<OrgMemberDto[]>(() => data?.members ?? [], [data]);

  const filtered = useMemo(() => {
    return members.filter(m => {
      const uiRole = mapRoleToUi(m.role);
      if (roleFilter !== "all" && uiRole !== roleFilter) return false;
      if (search && !m.username.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [members, roleFilter, search]);

  const currentUserRole = members.find(m => m.userId === user?.userId)?.role;
  const isAdmin = currentUserRole === "OrgAdmin";

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
      const message = err instanceof Error ? err.message : (err as { message?: string })?.message || "Failed to add member.";
      toast({ title: "Invite failed", description: message, variant: "destructive" });
    }
  };

  const handleRemoveMember = async () => {
    if (!activeOrg?.orgId || !removeMember) return;
    try {
      await removeMemberMutation.mutateAsync({ orgId: activeOrg.orgId, userId: removeMember.userId });
      toast({ title: "Member removed", description: `${removeMember.username} has been removed from the organisation.` });
      setRemoveMember(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as { message?: string })?.message || "Failed to remove member.";
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
      const message = err instanceof Error ? err.message : (err as { message?: string })?.message || "Failed to change role.";
      toast({ title: "Role change failed", description: message, variant: "destructive" });
    }
  };

  return (
    <AppLayout
      title="Team Members"
      subtitle={activeOrg ? `${members.length} members in ${activeOrg.orgName}` : "Select an organisation to view members"}
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
          <Select value={roleFilter} onValueChange={(value: UiRole | "all") => setRoleFilter(value)}>
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
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Member</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Role</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Joined</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map(m => {
              const uiRole = mapRoleToUi(m.role);
              const roleMeta = ROLE_META[uiRole];
              const RoleIcon = roleMeta.icon;
              const isSelf = m.userId === user?.userId;
              return (
                <TableRow
                  key={m.userId}
                  style={{ backgroundColor: "var(--c-bacSec)", borderColor: "var(--c-borPri)" }}
                  className="hover:bg-[var(--c-bacTer)]"
                >
                  {/* Member */}
                  <TableCell>
                    <Link
                      to="/dashboard/org/members/$memberId"
                      params={{ memberId: m.userId }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: "var(--c-bluBacSec)", color: "var(--c-bluTexAccPri)" }}
                      >
                        {m.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>
                          {m.username}
                          {isSelf && <span className="text-xs ml-1" style={{ color: "var(--c-texTer)" }}>(you)</span>}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--c-texTer)" }}>
                          {uiRole === "admin" ? "Org Admin" : "Member"}
                        </p>
                      </div>
                    </Link>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <RoleIcon className="w-3.5 h-3.5" style={{ color: roleMeta.color }} />
                      <span className="text-xs font-medium" style={{ color: roleMeta.color }}>{roleMeta.label}</span>
                    </div>
                  </TableCell>

                  {/* Joined */}
                  <TableCell>
                    <span className="text-xs font-mono" style={{ color: "var(--c-texTer)" }}>
                      {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "—"}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--c-greTexAccPri)" }} />
                      <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Active</span>
                    </div>
                  </TableCell>

                  {/* Actions — dropdown menu */}
                  <TableCell className="text-right">
                    {isAdmin && !isSelf ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions for ${m.username}`}>
                            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--c-texTer)" }} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
                          <DropdownMenuItem asChild>
                            <Link to="/dashboard/org/members/$memberId" params={{ memberId: m.userId }}>
                              <Users className="w-3.5 h-3.5 mr-2" /> View Details
                            </Link>
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
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
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

      {/* ---- Invite Dialog ---- */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--c-texPri)" }}>Invite a member</DialogTitle>
            <DialogDescription style={{ color: "var(--c-texSec)" }}>
              Enter the username of an existing user to add them to <strong>{activeOrg?.orgName}</strong>.
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
        <AlertDialogContent style={{ backgroundColor: "var(--c-bacPri)", borderColor: "var(--c-borPri)" }}>
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