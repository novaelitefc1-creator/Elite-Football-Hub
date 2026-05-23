import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListNews, useListSponsors, useGetDashboardSummary } from "@workspace/api-client-react";

export default function Home() {
  const { data: news } = useListNews({ limit: 3 });
  const { data: sponsors } = useListSponsors();
  const { data: summary } = useGetDashboardSummary();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
          <img
            src="https://images.unsplash.com/photo-1518605368461-1e1252220a22?auto=format&fit=crop&q=80&w=2000"
            alt="Football pitch at night"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white mb-6"
          >
            Forge Your <span className="text-primary">Legacy</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto mb-10"
          >
            The premier development academy for the next generation of elite footballers. Technical excellence, tactical intelligence, and uncompromising discipline.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/trials" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg uppercase tracking-wider font-bold rounded-none">
                Apply for Trials
              </Button>
            </Link>
            <Link href="/programs" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full text-lg uppercase tracking-wider font-bold rounded-none border-primary text-primary hover:bg-primary hover:text-black">
                Explore Programs
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">40+</div>
              <div className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Pro Contracts</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">{summary?.totalPlayers || "120"}+</div>
              <div className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Elite Players</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">6</div>
              <div className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">UEFA Pro Coaches</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">12</div>
              <div className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">National Titles</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Latest News</h2>
            </div>
            <Link href="/news" className="text-primary hover:text-white uppercase font-bold text-sm tracking-wider transition-colors">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news?.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="group block cursor-pointer">
                <div className="relative aspect-[4/3] mb-4 overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-primary font-black opacity-20 text-4xl">NOVA</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-black px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {item.category}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <h3 className="text-xl font-bold uppercase leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 line-clamp-2">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
