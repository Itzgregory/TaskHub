import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRole } from "@/lib/api/types";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgName?: string;
  username: string;
  onUsernameChange: (value: string) => void;
  role: UserRole;
  onRoleChange: (value: UserRole) => void;
  onInvite: () => void;
  isPending: boolean;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  orgName,
  username,
  onUsernameChange,
  role,
  onRoleChange,
  onInvite,
  isPending,
}: InviteMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--c-texPri)" }}>Invite a member</DialogTitle>
          <DialogDescription style={{ color: "var(--c-texSec)" }}>
            Enter the username of an existing user to add them to <strong>{orgName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-username" style={{ color: "var(--c-texPri)" }}>Username</Label>
            <Input
              id="invite-username"
              type="text"
              placeholder="john_doe"
              value={username}
              onChange={e => onUsernameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role" style={{ color: "var(--c-texPri)" }}>Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={e => onRoleChange(e.target.value as UserRole)}
              className="th-select w-full"
            >
              <option value="Member">Member</option>
              <option value="OrgAdmin">Admin</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={onInvite}
            disabled={!username.trim() || isPending}
            style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "#fff" }}
          >
            {isPending ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}