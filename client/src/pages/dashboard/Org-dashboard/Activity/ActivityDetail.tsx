import { AppLayout } from "@/components/layout/dashboard/AppLayout";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft, CheckCircle2, MessageSquare, Plus, UserPlus,
  ArrowRight, FileText, Clock, FolderKanban, User,
  ThumbsUp, MoreHorizontal,
} from "lucide-react";

interface ActivityEvent {
  id: string; user: string; avatar: string; avatarColor: string;
  action: string; target: string; project: string; projectColor: string;
  time: string; fullTime: string;
  type: "complete" | "comment" | "create" | "assign" | "move" | "upload";
  description: string;
  comments: { user: string; avatar: string; color: string; text: string; time: string }[];
  relatedTasks: { title: string; status: "todo" | "in_progress" | "done" }[];
}

const EVENTS: Record<string, ActivityEvent> = {
  "1": {
    id: "1", user: "Sarah Chen", avatar: "SC", avatarColor: "#6366f1",
    action: "completed", target: "Design system audit", project: "Product Redesign", projectColor: "#6366f1",
    time: "2 minutes ago", fullTime: "Feb 20, 2025 at 2:47 PM",
    type: "complete",
    description: "Completed the full design system audit covering typography, colour palette, spacing tokens, and component variants. All findings documented in the shared Notion workspace. 14 inconsistencies identified and flagged for resolution in Sprint 16.",
    comments: [
      { user: "Alex Kim", avatar: "AK", color: "#3b82f6", text: "Great work! I'll pick up the typography inconsistencies first.", time: "1m ago" },
      { user: "Marcus Johnson", avatar: "MJ", color: "#f59e0b", text: "The spacing token findings are really helpful. Let's discuss in standup.", time: "Just now" },
    ],
    relatedTasks: [
      { title: "Update spacing tokens in design system", status: "todo" },
      { title: "Fix typography scale inconsistencies", status: "in_progress" },
      { title: "Document colour palette decisions", status: "done" },
    ],
  },
  "2": {
    id: "2", user: "Marcus Johnson", avatar: "MJ", avatarColor: "#f59e0b",
    action: "commented on", target: "API integration spec", project: "API Infrastructure", projectColor: "#3b82f6",
    time: "15 minutes ago", fullTime: "Feb 20, 2025 at 2:32 PM",
    type: "comment",
    description: "Added detailed comments on the REST vs GraphQL section of the API spec. Recommended a hybrid approach using REST for CRUD operations and GraphQL for complex data fetching. Included benchmark comparisons from staging.",
    comments: [
      { user: "Alex Johnson", avatar: "AJ", color: "#8b5cf6", text: "Solid analysis. The benchmark numbers are compelling. Let's prototype both approaches.", time: "10m ago" },
    ],
    relatedTasks: [
      { title: "Prototype REST endpoints", status: "in_progress" },
      { title: "Prototype GraphQL schema", status: "todo" },
      { title: "Write API integration spec", status: "done" },
    ],
  },
};

const fallbackEvent = EVENTS["1"];

const TYPE_ICON = {
  complete: CheckCircle2,
  comment: MessageSquare,
  create: Plus,
  assign: UserPlus,
  move: ArrowRight,
  upload: FileText,
};

const TYPE_COLOR = {
  complete: "var(--c-greTexAccPri)",
  comment: "var(--c-bluTexAccPri)",
  create: "var(--c-yelTexAccPri)",
  assign: "var(--c-oraTexAccPri)",
  move: "var(--c-texTer)",
  upload: "var(--c-bluTexAccPri)",
};

const STATUS_ICON_MAP: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  todo: { icon: Clock, color: "var(--c-texDis)" },
  in_progress: { icon: Clock, color: "var(--c-bluTexAccPri)" },
  done: { icon: CheckCircle2, color: "var(--c-greTexAccPri)" },
};

export default function ActivityDetail() {
  const { activityId } = useParams({ from: "/dashboard/org/activity/$activityId" });
  const event = EVENTS[activityId || ""] || fallbackEvent;
  const TypeIcon = TYPE_ICON[event.type];

  return (
    <AppLayout title="Activity Detail" subtitle={event.target}>
      {/* Back link */}
      <Link to="/dashboard/org/activity" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:underline" style={{ color: "var(--c-bluTexAccPri)" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Activity
      </Link>

      {/* Event header */}
      <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: event.avatarColor + "20", color: event.avatarColor }}>
            {event.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-base font-semibold" style={{ color: "var(--c-texPri)" }}>{event.user}</h2>
              <span className="text-sm" style={{ color: "var(--c-texTer)" }}>{event.action}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>{event.target}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--c-texTer)" }}>
              <span className="flex items-center gap-1">
                <TypeIcon className="w-3 h-3" style={{ color: TYPE_COLOR[event.type] }} />
                {event.type.replace("_", " ")}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.projectColor }} />
                {event.project}
              </span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.fullTime}</span>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-[var(--c-bacTer)]"><MoreHorizontal className="w-4 h-4" style={{ color: "var(--c-texTer)" }} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Description + Comments */}
        <div className="lg:col-span-3 space-y-6">
          {/* Description */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--c-texPri)" }}>Details</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--c-texSec)" }}>{event.description}</p>
          </div>

          {/* Comments */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--c-texPri)" }}>Comments ({event.comments.length})</h3>
            <div className="space-y-4">
              {event.comments.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0" style={{ backgroundColor: c.color + "20", color: c.color }}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--c-texPri)" }}>{c.user}</span>
                      <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>{c.time}</span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--c-texSec)" }}>{c.text}</p>
                  </div>
                  <button className="p-1 rounded hover:bg-[var(--c-bacTer)]">
                    <ThumbsUp className="w-3 h-3" style={{ color: "var(--c-texDis)" }} />
                  </button>
                </div>
              ))}
            </div>
            {/* Reply input */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--c-borPri)" }}>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Write a comment..." className="th-input text-sm flex-1" />
                <button className="px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}>Reply</button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tasks */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--c-texPri)" }}>Related Tasks</h3>
          <div className="space-y-2">
            {event.relatedTasks.map((t, i) => {
              const si = STATUS_ICON_MAP[t.status];
              const SI = si.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--c-bacTer)]">
                  <SI className="w-3.5 h-3.5 flex-shrink-0" style={{ color: si.color }} />
                  <span className="text-sm flex-1" style={{ color: t.status === "done" ? "var(--c-texTer)" : "var(--c-texPri)", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
