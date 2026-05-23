import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  useListPlayers,
  useUpdatePlayer,
  getListPlayersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  AlertTriangle,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DocStatus = "all" | "pending" | "complete" | "missing";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active:   { label: "Active",   className: "bg-primary/10 text-primary border-primary/20" },
  pending:  { label: "Pending",  className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  inactive: { label: "Inactive", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  rejected: { label: "Rejected", className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

export default function AdminDocuments() {
  const [filter, setFilter] = useState<DocStatus>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data: players = [], isLoading } = useListPlayers({ query: { queryKey: getListPlayersQueryKey() } });
  const updatePlayer = useUpdatePlayer();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getDocStatus = (p: (typeof players)[number]) => {
    if (p.passportUrl && p.govIdUrl) return "complete";
    if (!p.passportUrl && !p.govIdUrl) return "missing";
    return "pending";
  };

  const filtered = players.filter((p) => {
    if (filter === "all") return true;
    if (filter === "pending") return getDocStatus(p) === "pending" || (getDocStatus(p) === "complete" && p.status === "pending");
    if (filter === "complete") return getDocStatus(p) === "complete";
    if (filter === "missing") return getDocStatus(p) === "missing";
    return true;
  });

  const counts = {
    all: players.length,
    pending: players.filter((p) => getDocStatus(p) === "pending" || (getDocStatus(p) === "complete" && p.status === "pending")).length,
    complete: players.filter((p) => getDocStatus(p) === "complete").length,
    missing: players.filter((p) => getDocStatus(p) === "missing").length,
  };

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    updatePlayer.mutate(
      { id, data: { status: "active" } },
      {
        onSuccess: () => {
          toast({ title: "Player approved", description: "Account status set to Active." });
          queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
          setLoadingId(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to approve player.", variant: "destructive" });
          setLoadingId(null);
        },
      }
    );
  };

  const handleReject = async (id: number) => {
    setLoadingId(id);
    updatePlayer.mutate(
      { id, data: { status: "rejected" } },
      {
        onSuccess: () => {
          toast({ title: "Player rejected", description: "Account status set to Rejected." });
          queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
          setLoadingId(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to reject player.", variant: "destructive" });
          setLoadingId(null);
        },
      }
    );
  };

  const filterButtons: { key: DocStatus; label: string; icon: React.ElementType }[] = [
    { key: "all",      label: "All Players",        icon: Shield },
    { key: "pending",  label: "Awaiting Review",     icon: Clock },
    { key: "complete", label: "Docs Complete",        icon: CheckCircle },
    { key: "missing",  label: "Docs Missing",         icon: AlertTriangle },
  ];

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
            <div>
              <div className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Admin Panel</div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-white">Document Review</h1>
              <p className="text-muted-foreground text-sm mt-1">Review player identity documents and approve or reject registrations.</p>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="border-white/10 hover:border-primary/40 uppercase font-bold tracking-wider text-xs rounded-none" data-testid="link-back-admin">
                Back to Admin
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {filterButtons.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "bg-card border p-5 text-left transition-all",
                  filter === key ? "border-primary" : "border-white/10 hover:border-white/20"
                )}
                data-testid={`filter-${key}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={cn("w-4 h-4", filter === key ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-3xl font-black", filter === key ? "text-primary" : "text-white")}>
                    {counts[key]}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Showing {filtered.length} of {players.length} players
            </span>
          </div>

          {/* Player list */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground uppercase tracking-wider text-sm">Loading players...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10">
              <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white font-bold uppercase tracking-wider mb-2">No players found</p>
              <p className="text-muted-foreground text-sm">No players match the current filter.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((player) => {
                const docStatus = getDocStatus(player);
                const isExpanded = expandedId === player.id;
                const isProcessing = loadingId === player.id;
                const statusCfg = STATUS_CONFIG[player.status] ?? STATUS_CONFIG.pending;
                const needsReview = docStatus === "complete" && player.status === "pending";

                return (
                  <div
                    key={player.id}
                    className={cn(
                      "bg-card border transition-all",
                      needsReview ? "border-yellow-500/30" : "border-white/10",
                      isExpanded && "border-primary/40"
                    )}
                    data-testid={`card-player-${player.id}`}
                  >
                    {/* Row header */}
                    <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : player.id)}>
                      {/* Avatar */}
                      <div className={cn(
                        "w-10 h-10 flex items-center justify-center flex-shrink-0 font-black text-sm border",
                        needsReview ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : "bg-secondary border-white/10 text-white"
                      )}>
                        {player.user?.firstName?.[0]}{player.user?.lastName?.[0]}
                      </div>

                      {/* Name & position */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-white font-bold uppercase tracking-wider text-sm">
                            {player.user?.firstName} {player.user?.lastName}
                          </span>
                          {needsReview && (
                            <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20">
                              Awaiting Review
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground uppercase tracking-wider flex-wrap">
                          <span>{player.position}</span>
                          {player.nationality && <><span>·</span><span>{player.nationality}</span></>}
                          {player.team?.name && <><span>·</span><span className="text-white/60">{player.team.name}</span></>}
                        </div>
                      </div>

                      {/* Doc status pills */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <DocPill label="Passport" uploaded={!!player.passportUrl} />
                        <DocPill label="Gov ID" uploaded={!!player.govIdUrl} />
                      </div>

                      {/* Account status badge */}
                      <div className="hidden sm:block flex-shrink-0">
                        <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-1 border", statusCfg.className)}>
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Expand toggle */}
                      <div className="flex-shrink-0 text-muted-foreground">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-secondary/20 p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Passport */}
                          <DocumentRow
                            label="Passport"
                            objectPath={player.passportUrl ?? null}
                          />
                          {/* Government ID */}
                          <DocumentRow
                            label="Government ID"
                            objectPath={player.govIdUrl ?? null}
                          />
                        </div>

                        {/* Player details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                          <Detail label="Date of Birth" value={player.dateOfBirth} />
                          <Detail label="Phone" value={player.phone} />
                          <Detail label="Preferred Foot" value={player.preferredFoot} />
                          <Detail label="Email" value={player.user?.email} />
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/5">
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Current Status</p>
                            <span className={cn("text-sm font-bold uppercase tracking-wider px-3 py-1.5 border inline-block", statusCfg.className)}>
                              {statusCfg.label}
                            </span>
                          </div>
                          <div className="flex items-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => handleReject(player.id)}
                              disabled={isProcessing || player.status === "rejected"}
                              className="rounded-none border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 uppercase font-bold tracking-wider text-xs h-10 px-6"
                              data-testid={`button-reject-${player.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {isProcessing ? "Updating..." : "Reject"}
                            </Button>
                            <Button
                              onClick={() => handleApprove(player.id)}
                              disabled={isProcessing || player.status === "active" || docStatus === "missing"}
                              className="rounded-none bg-primary text-background hover:bg-primary/80 uppercase font-bold tracking-wider text-xs h-10 px-6 disabled:opacity-40"
                              data-testid={`button-approve-${player.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {isProcessing ? "Updating..." : "Approve & Activate"}
                            </Button>
                          </div>
                        </div>

                        {docStatus === "missing" && (
                          <p className="text-xs text-yellow-500/80 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            No documents uploaded yet. Approval is disabled until at least one document is submitted.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function DocPill({ label, uploaded }: { label: string; uploaded: boolean }) {
  return (
    <span className={cn(
      "hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2 py-1 border",
      uploaded
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-white/5 text-white/30 border-white/10"
    )}>
      {uploaded ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

function DocumentRow({ label, objectPath }: { label: string; objectPath: string | null }) {
  const uploaded = !!objectPath;
  const isImage = objectPath && /\.(jpe?g|png|webp|gif)$/i.test(objectPath);

  return (
    <div className="border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileText className={cn("w-4 h-4", uploaded ? "text-primary" : "text-white/30")} />
          <span className="text-xs font-bold uppercase tracking-wider text-white">{label}</span>
        </div>
        {uploaded ? (
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Uploaded
          </span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-white/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Not submitted
          </span>
        )}
      </div>

      {uploaded ? (
        <div className="p-4">
          {isImage ? (
            <div className="mb-3 bg-black border border-white/5 overflow-hidden" style={{ maxHeight: 160 }}>
              <img
                src={`/api/storage${objectPath}`}
                alt={label}
                className="w-full h-40 object-contain"
                data-testid={`img-doc-${label.toLowerCase().replace(/\s/g, "-")}`}
              />
            </div>
          ) : (
            <div className="mb-3 flex items-center gap-3 p-3 bg-black/30 border border-white/5">
              <FileText className="w-8 h-8 text-primary/60" />
              <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">PDF Document</p>
                <p className="text-muted-foreground text-xs mt-0.5 truncate max-w-xs">{objectPath}</p>
              </div>
            </div>
          )}
          <a
            href={`/api/storage${objectPath}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`link-view-doc-${label.toLowerCase().replace(/\s/g, "-")}`}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-none border-white/10 hover:border-primary/40 hover:text-primary uppercase font-bold tracking-wider text-xs h-9"
            >
              <Eye className="w-3.5 h-3.5 mr-2" /> View Full Document
            </Button>
          </a>
        </div>
      ) : (
        <div className="p-4 flex items-center justify-center h-24 text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">Player has not uploaded this document yet.</p>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-sm font-bold">{value || "—"}</p>
    </div>
  );
}
