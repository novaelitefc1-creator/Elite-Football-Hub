import { AppLayout } from "@/components/AppLayout";
import { useGetTeam, useListPlayers, useListSchedules, getGetTeamQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function TeamDetail() {
  const { id } = useParams();
  const teamId = id ? parseInt(id, 10) : 0;

  const { data: team, isLoading: teamLoading } = useGetTeam(teamId, {
    query: { enabled: !!teamId, queryKey: getGetTeamQueryKey(teamId) }
  });

  const { data: players } = useListPlayers({ team: teamId.toString() }, {
    query: { enabled: !!teamId }
  });

  const { data: schedules } = useListSchedules({ team: teamId.toString() }, {
    query: { enabled: !!teamId }
  });

  if (teamLoading) {
    return <AppLayout><div className="pt-32 pb-20 min-h-screen bg-background">Loading...</div></AppLayout>;
  }

  if (!team) {
    return <AppLayout><div className="pt-32 pb-20 min-h-screen bg-background text-white text-center">Team not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 border-b border-white/10 pb-8">
            <div className="text-primary font-bold uppercase tracking-wider mb-2">{team.ageGroup}</div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-white">{team.name}</h1>
            <p className="text-muted-foreground max-w-3xl text-lg mb-6">{team.description}</p>
            <div className="flex space-x-8 text-sm">
              <div><span className="text-muted-foreground uppercase tracking-wider">Coach:</span> <span className="text-white font-bold ml-2">{team.coach}</span></div>
              <div><span className="text-muted-foreground uppercase tracking-wider">Players:</span> <span className="text-white font-bold ml-2">{team.playerCount}</span></div>
              <div><span className="text-muted-foreground uppercase tracking-wider">Win Rate:</span> <span className="text-primary font-bold ml-2">{team.winRate}%</span></div>
              <div><span className="text-muted-foreground uppercase tracking-wider">Trophies:</span> <span className="text-primary font-bold ml-2">{team.trophies}</span></div>
            </div>
          </div>

          <Tabs defaultValue="roster" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-secondary rounded-none border border-white/10 p-0 h-auto">
              <TabsTrigger value="roster" className="rounded-none py-3 uppercase tracking-wider font-bold data-[state=active]:bg-primary data-[state=active]:text-black transition-all">Roster</TabsTrigger>
              <TabsTrigger value="schedule" className="rounded-none py-3 uppercase tracking-wider font-bold data-[state=active]:bg-primary data-[state=active]:text-black transition-all">Training Schedule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="roster" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players?.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-card border-white/10 hover:border-primary transition-colors">
                      <CardHeader className="pb-2 border-b border-white/5">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl font-bold uppercase">{player.user?.firstName} {player.user?.lastName}</CardTitle>
                          <div className="text-xs bg-secondary px-2 py-1 text-primary uppercase font-bold tracking-wider">{player.position}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 text-sm text-muted-foreground space-y-2">
                        <div className="flex justify-between"><span>Nationality</span><span className="text-white">{player.nationality}</span></div>
                        <div className="flex justify-between"><span>Preferred Foot</span><span className="text-white">{player.preferredFoot || "N/A"}</span></div>
                        <div className="flex justify-between"><span>Height</span><span className="text-white">{player.height ? `${player.height}cm` : "N/A"}</span></div>
                        <div className="flex justify-between"><span>Weight</span><span className="text-white">{player.weight ? `${player.weight}kg` : "N/A"}</span></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {players?.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-white/10">
                    No players currently assigned to this roster.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="mt-8">
               <div className="space-y-4">
                {schedules?.map((schedule, idx) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-primary transition-colors"
                  >
                    <div className="mb-4 md:mb-0">
                      <div className="text-primary font-bold uppercase tracking-wider mb-1">{schedule.dayOfWeek}</div>
                      <div className="text-xl text-white font-bold">{schedule.startTime} - {schedule.endTime}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground"><span className="w-24 uppercase text-xs tracking-wider">Location:</span> <span className="text-white">{schedule.location}</span></div>
                      <div className="flex items-center text-muted-foreground"><span className="w-24 uppercase text-xs tracking-wider">Type:</span> <span className="text-white">{schedule.type}</span></div>
                      {schedule.notes && <div className="flex items-center text-muted-foreground"><span className="w-24 uppercase text-xs tracking-wider">Notes:</span> <span className="text-white">{schedule.notes}</span></div>}
                    </div>
                  </motion.div>
                ))}
                {schedules?.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground border border-dashed border-white/10">
                    No upcoming training sessions scheduled.
                  </div>
                )}
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}