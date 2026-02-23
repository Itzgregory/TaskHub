import { 
  FileText, Layout, CheckSquare, Database, 
  MessageSquare, GitBranch, Figma, Slack, 
  Chrome, Globe, Calendar, Zap, Shield, 
  Smartphone, RefreshCw, Search, Settings, 
  Bell, Lock, Users, Twitter, Facebook, 
  Linkedin, Youtube 
} from "lucide-react";
import type { LucideIcon } from "lucide-react"; 

export const NAV_LINKS = ["Product", "Download", "Templates", "Pricing", "Enterprise"];

export const FEATURES: { Icon: LucideIcon; title: string; desc: string }[] = [
  {
    Icon: FileText,
    title: "Docs that are actually useful",
    desc: "Write, plan, and organize with the simplicity of a document and the power of a database. Embed anything.",
  },
  {
    Icon: Layout,
    title: "Wikis your team will love",
    desc: "Give every team a home. Centralize processes, best practices, and know-how in one searchable place.",
  },
  {
    Icon: CheckSquare,
    title: "Projects without the chaos",
    desc: "Plan, track, and ship every project with unlimited tasks, timelines, kanban boards, and sprints.",
  },
  {
    Icon: Database,
    title: "Databases, built for humans",
    desc: "Slice and dice your data any way you need. Switch between table, board, calendar, gallery, or list views.",
  },
];

export const FEATURE_PILLS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Shield, label: "SOC 2 Certified" },
  { Icon: Smartphone, label: "Mobile apps" },
  { Icon: RefreshCw, label: "Real-time sync" },
  { Icon: Search, label: "Full-text search" },
  { Icon: Settings, label: "API access" },
  { Icon: Bell, label: "Smart notifications" },
  { Icon: Lock, label: "Granular permissions" },
  { Icon: Users, label: "Unlimited guests" },
];

export const INTEGRATIONS: { Icon: LucideIcon; name: string; color: string }[] = [
  { Icon: Slack, name: "Slack", color: "#611f69" },
  { Icon: Figma, name: "Figma", color: "#f24e1e" },
  { Icon: GitBranch, name: "GitHub", color: "#24292e" },
  { Icon: Chrome, name: "Google Drive", color: "#4285f4" },
  { Icon: MessageSquare, name: "Jira", color: "#0052cc" },
  { Icon: Zap, name: "Zapier", color: "#ff4a00" },
  { Icon: Globe, name: "Notion API", color: "#000" },
  { Icon: Calendar, name: "Google Cal", color: "#34a853" },
];

export const INTEGRATION_BULLETS = [
  "Two-way sync with Slack, Jira, and GitHub",
  "Import from Notion, Confluence, or Trello in one click",
  "Embed any website, video, or document",
  "Open API for custom workflows",
];

export const TESTIMONIALS: { quote: string; name: string; role: string; initials: string }[] = [
  {
    quote: "TaskHub replaced five different tools we were using. Our entire team is on the same page for the first time in years.",
    name: "Amara Okafor",
    role: "Product Manager, Spotify",
    initials: "AO",
  },
  {
    quote: "The flexibility is unreal. We built our entire company wiki, project tracker, and CRM in TaskHub. It just works.",
    name: "Kwame Mensah",
    role: "CTO, Headspace",
    initials: "KM",
  },
  {
    quote: "I switched from Asana, Notion, and Confluence to TaskHub. Haven't looked back once. It's that good.",
    name: "Fatima Diallo",
    role: "Engineering Lead, Figma",
    initials: "FD",
  },
  {
    quote: "Onboarding new team members used to take days. Now I just send them our TaskHub workspace and they're up in an hour.",
    name: "Chidi Eze",
    role: "Operations Director, Stripe",
    initials: "CE",
  },
  {
    quote: "The docs + tasks combo is a killer feature. We write the spec and track the work in the exact same place.",
    name: "Nala Dlamini",
    role: "Design Lead, Airbnb",
    initials: "ND",
  },
  {
    quote: "We've tried everything. TaskHub is the first tool that actually stuck across engineering, design, and marketing.",
    name: "Tunde Adeyemi",
    role: "CEO, Match Group",
    initials: "TA",
  },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Is TaskHub free?",
    a: "Yes! TaskHub is free for individuals and small teams. Paid plans unlock unlimited blocks, advanced permissions, and admin tools.",
  },
  {
    q: "Can I use it offline?",
    a: "TaskHub has a desktop app with offline support. Changes sync automatically when you reconnect to the internet.",
  },
  {
    q: "How does billing work?",
    a: "We bill monthly or annually (save 20%). You can upgrade, downgrade, or cancel at any time — no lock-in.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use AES-256 encryption at rest and TLS in transit. We're SOC 2 Type II certified and GDPR compliant.",
  },
  {
    q: "Can I migrate from another tool?",
    a: "Yes. We have one-click importers for Notion, Confluence, Asana, Trello, Evernote, and plain Markdown.",
  },
  {
    q: "Do you offer a student or nonprofit discount?",
    a: "We offer TaskHub Plus free for students and 50% off for nonprofits. Contact us with proof and we'll set you up.",
  },
];

export const COMPANIES = ["Pixar", "Match Group", "Headspace", "Figma", "Spotify", "Stripe", "Airbnb", "Linear"];

export const FOOTER_SECTIONS: { title: string; links: string[] }[] = [
  {
    title: "Product",
    links: ["Docs", "Projects", "Wikis", "Calendar", "Templates", "Integrations"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press", "Brand"],
  },
  {
    title: "Resources",
    links: ["Help center", "API docs", "Community", "Webinars", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "Cookie settings", "Sitemap"],
  },
];

export const SOCIAL_ICONS: LucideIcon[] = [Twitter, Facebook, Linkedin, Youtube];