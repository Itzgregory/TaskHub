import { useState } from "react";
import { User, Save } from "lucide-react";
import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { StatCard } from "../../../components/features/StatCard";
import { useStore, actions } from "../../../lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(actions.updateProfile({ name, email }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.status === "done").length;

  return (
    <AppLayout title="Profile">
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--c-bluBacSec)" }}
          >
            <User className="w-8 h-8" style={{ color: "var(--c-bluTexAccPri)" }} />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--c-texPri)" }}>
              {state.profile.name}
            </h2>
            <p className="text-sm" style={{ color: "var(--c-texTer)" }}>{state.profile.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Tasks" value={totalTasks} />
          <StatCard label="Completed" value={completedTasks} />
          <StatCard label="Projects" value={state.projects.length} />
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>
            Edit Profile
          </h3>

          <div className="space-y-1">
            <Label className="text-xs" style={{ color: "var(--c-texSec)" }}>Name</Label>
            <Input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="th-input"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs" style={{ color: "var(--c-texSec)" }}>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="th-input"
            />
          </div>

          <Button
            type="submit"
            className="flex items-center gap-2"
            style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
