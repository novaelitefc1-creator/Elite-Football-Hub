import { AppLayout } from "@/components/AppLayout";
import { useListTeams } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Teams() {
  const { data: teams, isLoading } = useListTeams();

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-white">Academy <span className="text-primary">Teams</span></h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Meet the squads competing at the highest levels of youth football.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {teams?.map((team, idx) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative h-80 overflow-hidden bg-card border border-white/10 cursor-pointer block"
                >
                  <div className="absolute inset-0 z-0">
                    {team.imageUrl ? (
                      <img src={team.imageUrl} alt={team.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full bg-secondary opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-primary font-bold uppercase tracking-wider text-sm mb-2">{team.ageGroup}</div>
                        <h2 className="text-3xl font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{team.name}</h2>
                      </div>
                      <div className="text-right text-sm text-gray-300">
                        <div>Players: <span className="text-white font-bold">{team.playerCount}</span></div>
                        <div>Coach: <span className="text-white font-bold">{team.coach}</span></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}