import { AppLayout } from "@/components/AppLayout";
import { useListGallery } from "@workspace/api-client-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { data: images, isLoading } = useListGallery();

  const categories = ["All", ...Array.from(new Set(images?.map(img => img.category) || []))];

  const filteredImages = activeCategory === "All" 
    ? images 
    : images?.filter(img => img.category === activeCategory);

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 text-white">Academy <span className="text-primary">Gallery</span></h1>
            
            <div className="flex flex-wrap gap-4 border-b border-white/10 pb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`uppercase font-bold text-sm tracking-wider px-4 py-2 transition-colors ${
                    activeCategory === category 
                      ? "bg-primary text-black" 
                      : "bg-transparent text-muted-foreground hover:text-white border border-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-square bg-card animate-pulse border border-white/5" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages?.map((image, idx) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative aspect-square group cursor-pointer overflow-hidden border border-white/5 bg-secondary">
                        <img 
                          src={image.imageUrl} 
                          alt={image.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
                          <h4 className="text-white font-bold uppercase tracking-wider mb-2">{image.title}</h4>
                          <span className="text-primary text-xs font-bold uppercase tracking-widest">{image.category}</span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl bg-black/95 border-white/10 p-1">
                      <div className="relative w-full h-full min-h-[50vh] flex flex-col">
                        <img src={image.imageUrl} alt={image.title} className="w-full max-h-[80vh] object-contain" />
                        <div className="p-4 bg-black/80">
                          <h3 className="text-xl font-bold uppercase text-white">{image.title}</h3>
                          {image.description && <p className="text-muted-foreground mt-2">{image.description}</p>}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}