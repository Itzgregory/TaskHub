import { useState } from "react";
import { User, Save } from "lucide-react";
import { AppLayout } from "../../components/layout/dasboard/AppLayout";
import { useStore, actions } from "../../lib/store";

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
      <div className="max-w-md space-y-6">
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
          {[
            { label: "Total Tasks", value: totalTasks },
            { label: "Completed", value: completedTasks },
            { label: "Projects", value: state.projects.length },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-4 rounded-xl text-center"
              style={{
                border: "1px solid var(--c-borPri)",
                backgroundColor: "var(--c-bacSec)",
              }}
            >
              <div
                className="text-2xl font-semibold font-mono"
                style={{ color: "var(--c-texPri)" }}
              >
                {value}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--c-texTer)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>
            Edit Profile
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: "var(--c-texSec)" }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="th-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: "var(--c-texSec)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="th-input"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
