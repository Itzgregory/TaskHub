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
import type { OrgMemberDto } from "@/lib/api/types";

interface RemoveMemberDialogProps {
  member: OrgMemberDto | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  orgName?: string;
  isPending: boolean;
}

export function RemoveMemberDialog({
  member,
  onOpenChange,
  onConfirm,
  orgName,
  isPending,
}: RemoveMemberDialogProps) {
  return (
    <AlertDialog open={!!member} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{ backgroundColor: "var(--c-bacPri)", borderColor: "var(--c-borPri)" }}>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: "var(--c-texPri)" }}>Remove member?</AlertDialogTitle>
          <AlertDialogDescription style={{ color: "var(--c-texSec)" }}>
            This will remove <strong>{member?.username}</strong> from <strong>{orgName}</strong>.
            They will lose access to all todos in this organisation. This action can be undone by re-inviting them.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            style={{ backgroundColor: "var(--c-redTexAccPri)", color: "#fff" }}
          >
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}