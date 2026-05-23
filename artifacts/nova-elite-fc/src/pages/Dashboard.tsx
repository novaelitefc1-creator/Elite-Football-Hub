import { AppLayout } from "@/components/AppLayout";
import { useGetPlayerDashboardSummary, useLogout, getGetPlayerDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { LogOut, User, Calendar, FileText, Activity, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const logout = useLogout();
  
  const { data: summary, isLoading, error } = useGetPlayerDashboardSummary({
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
    return <AppLayout><div className="pt-32 min-h-screen bg-background text-center text-white">Loading Dashboard...</div></AppLayout>;
  }

  const { player, upcomingSchedules, teamName, trialStatus } = summary;

  return (
    <AppLayout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        {/* Header */}
        <div className="bg-card border-b border-white/10 pt-12 pb-8 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="w-24 h-24 bg-secondary flex items-center justify-center border-2 border-primary">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <div className="text-primary font-bold uppercase tracking-widest text-sm mb-1">Player Profile</div>
                <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">
                  {player.user?.firstName} {player.user?.lastName}
                </h1>
                <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <span>{player.position}</span>
                  {teamName && (
                    <>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span className="text-white">{teamName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-white/10 hover:bg-white/5 uppercase font-bold tracking-wider text-xs rounded-none">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Stats & Status */}
            <div className="space-y-8">
              <Card className="bg-card border-white/10 rounded-none">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-primary" /> Status & Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-muted-foreground text-sm uppercase tracking-wider">Account Status</span>
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${player.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {player.status}
                    </span>
                  </div>
                  {trialStatus && (
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground text-sm uppercase tracking-wider">Trial Status</span>
                      <span className="text-white font-bold text-sm uppercase tracking-wider">{trialStatus}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-muted-foreground text-sm uppercase tracking-wider">DOB</span>
                    <span className="text-white text-sm">{format(new Date(player.dateOfBirth), "PP")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm uppercase tracking-wider">Nationality</span>
                    <span className="text-white text-sm">{player.nationality}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-white/10 rounded-none">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-primary" /> Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-secondary/50 border border-white/5">
                    <span className="text-sm font-bold uppercase tracking-wider text-white">Passport</span>
                    {player.passportUrl ? (
                      <span className="text-primary text-xs font-bold uppercase tracking-wider">Uploaded</span>
                    ) : (
                      <Button variant="link" className="h-auto p-0 text-primary text-xs font-bold uppercase tracking-wider">Upload</Button>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/50 border border-white/5">
                    <span className="text-sm font-bold uppercase tracking-wider text-white">Medical Clearance</span>
                    {player.govIdUrl ? (
                      <span className="text-primary text-xs font-bold uppercase tracking-wider">Verified</span>
                    ) : (
                      <Button variant="link" className="h-auto p-0 text-primary text-xs font-bold uppercase tracking-wider">Upload</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Schedule */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="bg-card border-white/10 rounded-none h-full">
                <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary" /> Upcoming Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {upcomingSchedules.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingSchedules.map((schedule) => (
                        <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-white/5 hover:border-primary/50 transition-colors bg-secondary/30">
                          <div className="w-24 text-center border-r border-white/10 pr-4">
                            <div className="text-primary font-bold uppercase tracking-wider">{schedule.dayOfWeek.substring(0, 3)}</div>
                            <div className="text-white font-black text-xl">{schedule.startTime.split(':')[0]}:{schedule.startTime.split(':')[1]}</div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold uppercase tracking-wider mb-1">{schedule.type}</h4>
                            <div className="text-muted-foreground text-sm flex items-center">
                              <MapPin className="w-3 h-3 mr-1" /> {schedule.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-white/10">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <h3 className="text-white font-bold uppercase tracking-wider mb-2">No Upcoming Events</h3>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto">You do not have any training sessions or matches scheduled at this time.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}