import { useToast } from "@/lib/hooks/use-toast";
import { useAddMember, useRemoveMember, useChangeRole } from "@/lib/api/hooks";
import type { OrgMemberDto, UserRole } from "@/lib/api/types";

export function useMemberActions(orgId?: string) {
  const { toast } = useToast();
  const addMemberMutation = useAddMember();
  const removeMemberMutation = useRemoveMember();
  const changeRoleMutation = useChangeRole();

  const handleInvite = async (
    username: string,
    role: UserRole,
    onSuccess: () => void
  ) => {
    if (!orgId || !username.trim()) return;
    try {
      await addMemberMutation.mutateAsync({
        orgId,
        data: { orgId, username: username.trim(), role },
      });
      toast({ 
        title: "Member added", 
        description: `${username.trim()} has been added as ${role}.` 
      });
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 
        (err as { message?: string })?.message || "Failed to add member.";
      toast({ title: "Invite failed", description: message, variant: "destructive" });
    }
  };

  const handleRemove = async (
    member: OrgMemberDto,
    onSuccess: () => void
  ) => {
    if (!orgId || !member) return;
    try {
      await removeMemberMutation.mutateAsync({ orgId, userId: member.userId });
      toast({ 
        title: "Member removed", 
        description: `${member.username} has been removed from the organisation.` 
      });
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 
        (err as { message?: string })?.message || "Failed to remove member.";
      toast({ title: "Remove failed", description: message, variant: "destructive" });
    }
  };

  return {
    handleInvite,
    handleRemove,
    isAdding: addMemberMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
  };
}