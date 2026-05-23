import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell, CheckCheck, ArrowLeft, UserCheck, UserX, FileUp, Calendar,
  MailCheck, MailX, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface Notification {
  id: number;
  type: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  relatedPlayerId: number | null;
  emailSent: boolean;
  emailError: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  player_approved: { label: "Player Approved", icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  player_rejected: { label: "Player Rejected", icon: UserX, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  document_submitted: { label: "Document Submitted", icon: FileUp, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  trial_booked: { label: "Trial Booked", icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "document_submitted", label: "Documents" },
  { key: "player_approved", label: "Approvals" },
  { key: "player_rejected", label: "Rejections" },
  { key: "trial_booked", label: "Trials" },
] as const;

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchNotifications(filter: string): Promise<Notification[]> {
  const params = new URLSearchParams();
  if (filter === "unread") params.set("unreadOnly", "true");
  else if (filter !== "all") params.set("type", filter);
  const res = await fetch(`${getApiUrl()}/notifications?${params}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

async function markRead(id: number): Promise<Notification> {
  const res = await fetch(`${getApiUrl()}/notifications/${id}/read`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.json();
}

async function markAllRead(): Promise<void> {
  await fetch(`${getApiUrl()}/notifications/mark-all-read`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function NotificationRow({ n, onRead }: { n: Notification; onRead: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[n.type] ?? { label: n.type, icon: Bell, color: "text-white", bg: "bg-white/5 border-white/10" };
  const Icon = meta.icon;

  function toggle() {
    setExpanded((v) => !v);
    if (!n.read) onRead(n.id);
  }

  return (
    <div className={`border transition-colors ${n.read ? "border-white/8 bg-card" : "border-primary/30 bg-primary/5"}`}>
      <button
        onClick={toggle}
        className="w-full flex items-start gap-4 p-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className={`flex-shrink-0 mt-0.5 p-2 border ${meta.bg}`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            )}
            <span className="text-xs text-muted-foreground ml-auto">{timeAgo(n.createdAt)}</span>
          </div>
          <p className="text-sm font-semibold text-white mt-0.5 truncate">{n.subject}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.recipientName} · {n.recipientEmail}</p>
        </div>

        <div className="flex-shrink-0 self-center text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/8 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recipient</p>
              <p className="text-sm text-white">{n.recipientName}</p>
              <p className="text-xs text-muted-foreground">{n.recipientEmail}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Type</p>
              <Badge variant="outline" className={`text-xs ${meta.color} border-current`}>{meta.label}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email Status</p>
              {n.emailSent ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                  <MailCheck className="w-3.5 h-3.5" />
                  <span>Sent</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                  <MailX className="w-3.5 h-3.5" />
                  <span>{n.emailError ? "Failed" : "Not configured"}</span>
                </div>
              )}
            </div>
            {n.relatedPlayerId && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Player</p>
                <Link href="/admin/documents">
                  <a className="flex items-center gap-1 text-primary text-xs hover:underline">
                    View in Document Review <ExternalLink className="w-3 h-3" />
                  </a>
                </Link>
              </div>
            )}
          </div>

          <div className="bg-black/20 border border-white/8 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Message Body</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{n.body}</pre>
          </div>

          {n.emailError && (
            <div className="mt-3 bg-red-900/20 border border-red-400/20 p-3">
              <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">Email Error</p>
              <p className="text-xs text-red-300/70">{n.emailError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminNotifications() {
  const [filter, setFilter] = useState<string>("all");
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => fetchNotifications(filter),
    refetchInterval: 30000,
  });

  const { data: countData } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/notifications/unread-count`, { headers: getAuthHeaders() });
      return res.json() as Promise<{ count: number }>;
    },
    refetchInterval: 15000,
  });

  const readMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });

  const unreadCount = countData?.count ?? 0;

  return (
    <AppLayout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <p className="text-primary text-sm font-bold uppercase tracking-widest mb-1">Admin Panel</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="bg-primary text-black text-xs font-black px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Email activity log — player approvals, rejections, document uploads, and trial bookings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="border-white/20 text-white hover:border-primary hover:text-primary"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Link href="/admin">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:border-primary hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
            </div>
          </div>

          {/* Email config notice */}
          <div className="mb-6 bg-amber-900/20 border border-amber-400/20 p-4 flex items-start gap-3">
            <Bell className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Email sending is optional</p>
              <p className="text-xs text-amber-300/70 mt-0.5">
                All notifications are stored here regardless. To also send emails, set <code className="bg-black/30 px-1 rounded text-amber-200">EMAIL_USER</code>, <code className="bg-black/30 px-1 rounded text-amber-200">EMAIL_PASS</code>, and <code className="bg-black/30 px-1 rounded text-amber-200">ADMIN_NOTIFY_EMAIL</code> in your environment secrets.
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  filter === f.key
                    ? "bg-primary text-black border-primary"
                    : "bg-transparent text-muted-foreground border-white/15 hover:border-primary hover:text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="border border-white/10 py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Bell className="w-10 h-10 opacity-20" />
              <p className="font-semibold uppercase tracking-wider text-sm">No notifications found</p>
              <p className="text-xs">Notifications appear here when players register, upload documents, book trials, or are approved/rejected.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                {unreadCount > 0 && ` · ${unreadCount} unread`}
              </p>
              {notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  n={n}
                  onRead={(id) => readMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
