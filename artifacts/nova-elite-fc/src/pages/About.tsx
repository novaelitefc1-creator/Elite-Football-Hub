import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";

export default function About() {
  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-16"
          >
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 text-white">Our <span className="text-primary">History</span> & Mission</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nova Elite FC Academy was founded with a single, uncompromising vision: to forge the next generation of elite footballers. Drawing inspiration from Europe's most storied clubs, we combine technical excellence, tactical intelligence, and absolute discipline to prepare our players for the highest levels of the game.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <img src="https://images.unsplash.com/photo-1574629810360-7efbb1925846?auto=format&fit=crop&q=80&w=1000" alt="Training facility" className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500 border border-primary/20" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold uppercase mb-4 text-white">World-Class Facilities</h2>
              <p className="text-muted-foreground mb-6">
                Our state-of-the-art training ground features 4 UEFA-standard grass pitches, an advanced performance analysis suite, a high-performance gym, and recovery pools. We provide our athletes with the exact same infrastructure used by Champions League teams.
              </p>
              <h2 className="text-3xl font-bold uppercase mb-4 text-white">Elite Coaching Staff</h2>
              <p className="text-muted-foreground">
                Led by UEFA Pro licensed coaches with experience at top European academies, our staff brings a wealth of tactical and technical knowledge. We maintain a 1:8 coach-to-player ratio to ensure individualized development and detailed feedback.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}