import { AppLayout } from "@/components/AppLayout";
import { DocumentUpload } from "@/components/DocumentUpload";
import { useGetPlayerDashboardSummary, useLogout, getGetPlayerDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { LogOut, User, Calendar, FileText, Activity, MapPin, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const logout = useLogout();

  const { data: summary, isLoading, error } = useGetPlayerDashboardSummary({
    query: {
      retry: false,
      queryKey: getGetPlayerDashboardSummaryQueryKey(),
    },
  });

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("token");
        setLocation("/login");
      },
    });
  };

  if (error) {
    setLocation("/login");
    return null;
  }

  if (isLoading || !summary) {
    return (
      <AppLayout>
        <div className="pt-32 min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-bold uppercase tracking-widest text-sm">Loading Dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { player, upcomingSchedules, teamName, trialStatus } = summary;
  const docsComplete = !!player.passportUrl && !!player.govIdUrl;

  return (
    <AppLayout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        {/* Header */}
        <div className="bg-card border-b border-white/10 pt-12 pb-8 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-secondary flex items-center justify-center border-2 border-primary">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <div className="text-primary font-bold uppercase tracking-widest text-sm mb-1">Player Profile</div>
                <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">
                  {player.user?.firstName} {player.user?.lastName}
                </h1>
                <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider text-muted-foreground flex-wrap">
                  <span>{player.position}</span>
                  {teamName && (
                    <>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span className="text-white">{teamName}</span>
                    </>
                  )}
                  {player.nationality && (
                    <>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span>{player.nationality}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-white/10 hover:bg-white/5 uppercase font-bold tracking-wider text-xs rounded-none w-fit"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Document alert banner */}
          {!docsComplete && (
            <div className="mb-8 flex items-start gap-4 border border-yellow-500/30 bg-yellow-500/5 p-4">
              <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-bold uppercase tracking-wider text-sm">Documents Required</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Your registration is incomplete. Please upload your passport and government-issued ID below to activate your account.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="space-y-6">
              {/* Status card */}
              <Card className="bg-card border-white/10 rounded-none">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-primary" /> Status & Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-muted-foreground text-sm uppercase tracking-wider">Account</span>
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                      player.status === "active" ? "bg-primary/10 text-primary" : "bg-yellow-500/10 text-yellow-500"
                    }`} data-testid="status-account">
                      {player.status}
                    </span>
                  </div>
                  {trialStatus && (
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground text-sm uppercase tracking-wider">Trial</span>
                      <span className="text-white font-bold text-sm uppercase tracking-wider">{trialStatus}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-muted-foreground text-sm uppercase tracking-wider">Date of Birth</span>
                    <span className="text-white text-sm">{format(new Date(player.dateOfBirth), "PP")}</span>
                  </div>
                  {player.preferredFoot && (
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground text-sm uppercase tracking-wider">Preferred Foot</span>
                      <span className="text-white text-sm capitalize">{player.preferredFoot}</span>
                    </div>
                  )}
                  {player.height && (
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground text-sm uppercase tracking-wider">Height</span>
                      <span className="text-white text-sm">{player.height} cm</span>
                    </div>
                  )}
                  {player.weight && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm uppercase tracking-wider">Weight</span>
                      <span className="text-white text-sm">{player.weight} kg</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents card — now with real upload */}
              <Card className="bg-card border-white/10 rounded-none">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-primary" /> Documents
                    </span>
                    {docsComplete && (
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">Complete</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <DocumentUpload
                    playerId={player.id}
                    label="Passport"
                    fieldName="passportUrl"
                    currentUrl={player.passportUrl}
                    accept="image/*,.pdf"
                  />
                  <DocumentUpload
                    playerId={player.id}
                    label="Government ID"
                    fieldName="govIdUrl"
                    currentUrl={player.govIdUrl}
                    accept="image/*,.pdf"
                  />
                  <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                    Documents are stored securely and only accessed by academy staff. Accepted formats: JPG, PNG, PDF (max 10MB each).
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column — Schedule */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-white/10 rounded-none">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary" /> Upcoming Training Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {upcomingSchedules.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingSchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-white/5 hover:border-primary/40 transition-colors bg-secondary/30"
                          data-testid={`card-schedule-${schedule.id}`}
                        >
                          <div className="w-28 text-center border-r border-white/10 pr-4 flex-shrink-0">
                            <div className="text-primary font-black uppercase tracking-widest text-xs mb-1">
                              {schedule.dayOfWeek.substring(0, 3)}
                            </div>
                            <div className="text-white font-black text-2xl leading-none">
                              {schedule.startTime.substring(0, 5)}
                            </div>
                            <div className="text-muted-foreground text-xs mt-1">
                              — {schedule.endTime.substring(0, 5)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold uppercase tracking-wider mb-1">{schedule.type}</h4>
                            {schedule.notes && (
                              <p className="text-muted-foreground text-xs mb-2 truncate">{schedule.notes}</p>
                            )}
                            <div className="flex items-center text-muted-foreground text-xs">
                              <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{schedule.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-white/10">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <h3 className="text-white font-bold uppercase tracking-wider mb-2">No Upcoming Sessions</h3>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        You have not been assigned to a team yet. Contact the academy to get started.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Player bio */}
              {player.bio && (
                <Card className="bg-card border-white/10 rounded-none">
                  <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center">
                      <User className="w-4 h-4 mr-2 text-primary" /> About
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-sm leading-relaxed">{player.bio}</p>
                  </CardContent>
                </Card>
              )}
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
