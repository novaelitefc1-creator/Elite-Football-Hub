import { AppLayout } from "@/components/AppLayout";
import { useListPrograms } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Programs() {
  const { data: programs, isLoading } = useListPrograms();

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-white">Academy <span className="text-primary">Programs</span></h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Structured development pathways designed to maximize potential at every stage of a player's journey.
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-card animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs?.map((program, idx) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-card border-white/10 hover:border-primary transition-colors overflow-hidden group">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {program.imageUrl ? (
                        <img src={program.imageUrl} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/20 font-black text-2xl uppercase">NOVA</div>
                      )}
                      <div className="absolute top-4 right-4 bg-primary text-black px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {program.level}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold uppercase tracking-tight">{program.title}</CardTitle>
                      <div className="text-sm text-primary font-medium">{program.ageRange} • {program.duration}</div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{program.description}</p>
                      {program.features && program.features.length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {program.features.map((feature, i) => (
                            <li key={i} className="text-sm flex items-center text-gray-300">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      {program.price && (
                        <div className="text-xl font-bold text-white mt-4 border-t border-white/10 pt-4">
                          ${program.price}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}