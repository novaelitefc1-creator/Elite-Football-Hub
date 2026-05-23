import { AppLayout } from "@/components/AppLayout";
import { useListNews } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function News() {
  const { data: news, isLoading } = useListNews();

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 border-b border-white/10 pb-6">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Academy <span className="text-primary">News</span></h1>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-80 bg-card animate-pulse border border-white/5" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news?.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/news/${item.id}`} className="group block cursor-pointer h-full border border-transparent hover:border-primary/50 transition-colors p-4 -m-4">
                    <div className="relative aspect-[4/3] mb-4 overflow-hidden bg-secondary">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-primary/20 font-black text-4xl uppercase tracking-tighter">NOVA</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-primary text-black px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {item.category}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2 flex items-center space-x-4">
                      <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                      {item.author && <span>By {item.author}</span>}
                    </div>
                    <h3 className="text-2xl font-bold uppercase leading-tight mb-3 text-white group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 line-clamp-3 leading-relaxed">{item.excerpt || item.content.substring(0, 150) + "..."}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}