import { AppLayout } from "@/components/AppLayout";
import { Link, useLocation } from "wouter";
import { useGetDashboardSummary, useLogout, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Users, Calendar as CalendarIcon, FileText, MessageSquare, LogOut, ArrowRight, ShieldCheck, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";

function useUnreadCount() {
  const token = localStorage.getItem("auth_token");
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/notifications/unread-count`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json() as Promise<{ count: number }>;
    },
    refetchInterval: 30000,
    enabled: !!token,
  });
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  
  const { data: summary, isLoading, error } = useGetDashboardSummary({
    query: { retry: false }
  });

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("token");
        setLocation("/login");
      }
    });
  };

  if (error) {
    setLocation("/login");
    return null;
  }

  if (isLoading || !summary) {
    return <AppLayout><div className="pt-32 min-h-screen bg-background text-center text-white">Loading Admin Dashboard...</div></AppLayout>;
  }

  const statCards = [
    { title: "Total Players", value: summary.totalPlayers, icon: Users, color: "text-primary" },
    { title: "Trial Bookings", value: summary.totalTrialBookings, icon: CalendarIcon, color: "text-white" },
    { title: "Pending Trials", value: summary.pendingBookings, icon: CalendarIcon, color: "text-yellow-500" },
    { title: "Unread Messages", value: summary.recentMessages, icon: MessageSquare, color: "text-white" },
  ];

  const adminLinks = [
    { href: "/admin/players", label: "Manage Players", icon: Users },
    { href: "/admin/trials", label: "Trial Management", icon: CalendarIcon },
    { href: "/admin/news", label: "News & Content", icon: FileText },
    { href: "/admin/scouting", label: "Scouting Reports", icon: FileText },
    { href: "/admin/documents", label: "Document Review", icon: ShieldCheck, highlight: true },
    { href: "/admin/notifications", label: "Notifications", icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  return (
    <AppLayout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="bg-card border-b border-white/10 pt-12 pb-8 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between">
            <div className="mb-6 md:mb-0">
              <div className="text-primary font-bold uppercase tracking-widest text-sm mb-1">Command Center</div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-white">
                Admin Dashboard
              </h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-white/10 hover:bg-white/5 uppercase font-bold tracking-wider text-xs rounded-none">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, i) => (
              <Card key={i} className="bg-card border-white/10 rounded-none">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                    <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
                  </div>
                  <div className="bg-secondary p-4 rounded-full border border-white/5">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-6">Management Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className={`group bg-card border p-6 cursor-pointer hover:border-primary transition-colors flex items-center justify-between ${link.highlight ? "border-primary/30 bg-primary/5" : "border-white/10"}`}>
                      <div className="flex items-center">
                        <div className={`p-3 mr-4 transition-colors border ${link.highlight ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-white/5 text-white group-hover:text-primary"}`}>
                          <link.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold uppercase tracking-wider group-hover:text-primary transition-colors ${link.highlight ? "text-primary" : "text-white"}`}>{link.label}</span>
                            {"badge" in link && link.badge !== undefined && (
                              <span className="bg-primary text-black text-xs font-black px-2 py-0.5 rounded-full leading-none">
                                {link.badge}
                              </span>
                            )}
                          </div>
                          {link.highlight && (
                            <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">Review &amp; approve player IDs</p>
                          )}
                          {"badge" in link && link.badge !== undefined && (
                            <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">Unread notifications</p>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Side Stats */}
            <div className="space-y-6">
              <Card className="bg-card border-white/10 rounded-none">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Players by Team</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {summary.playersByTeam?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-muted-foreground uppercase text-sm tracking-wider">{item.team || "Unassigned"}</span>
                      <span className="text-white font-bold">{item.count}</span>
                    </div>
                  ))}
                  {!summary.playersByTeam?.length && <div className="text-muted-foreground text-sm">No data available</div>}
                </CardContent>
              </Card>

              <Card className="bg-card border-white/10 rounded-none">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Trial Bookings</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {summary.bookingsByStatus?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-muted-foreground uppercase text-sm tracking-wider">{item.status}</span>
                      <span className="text-white font-bold">{item.count}</span>
                    </div>
                  ))}
                  {!summary.bookingsByStatus?.length && <div className="text-muted-foreground text-sm">No data available</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}