import { AppLayout } from "@/components/AppLayout";
import { useListTrials, useBookTrial } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Trials() {
  const { data: trials, isLoading } = useListTrials();
  const bookTrial = useBookTrial();
  const { toast } = useToast();
  const [selectedTrial, setSelectedTrial] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    playerName: "", email: "", phone: "", dateOfBirth: "", position: "", notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrial) return;
    
    bookTrial.mutate({
      data: {
        ...formData,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Booking successful", description: "Your trial spot has been reserved. We will contact you soon." });
        setSelectedTrial(null);
        setFormData({ playerName: "", email: "", phone: "", dateOfBirth: "", position: "", notes: "" });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Booking failed", description: "There was an error booking your trial." });
      }
    });
  };

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-white">Open <span className="text-primary">Trials</span></h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Prove yourself on the pitch. Register for upcoming talent identification sessions and earn your spot in the academy.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trials?.map((trial, idx) => (
              <motion.div
                key={trial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-white/10 p-6 flex flex-col hover:border-primary transition-colors"
              >
                <div className="mb-4 flex justify-between items-start">
                  <h3 className="text-xl font-bold uppercase text-white leading-tight">{trial.title}</h3>
                  <div className="bg-secondary text-white px-2 py-1 text-xs font-bold tracking-wider">{trial.ageGroup}</div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
                  <p><strong className="text-white">Date:</strong> {format(new Date(trial.date), "PPP p")}</p>
                  <p><strong className="text-white">Location:</strong> {trial.location}</p>
                  <p><strong className="text-white">Availability:</strong> {trial.spotsAvailable - trial.spotsBooked} spots left</p>
                  {trial.description && <p className="pt-2">{trial.description}</p>}
                </div>
                
                <Dialog open={selectedTrial === trial.id} onOpenChange={(open) => !open && setSelectedTrial(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full uppercase font-bold tracking-wider rounded-none" 
                      onClick={() => setSelectedTrial(trial.id)}
                      disabled={trial.spotsBooked >= trial.spotsAvailable}
                    >
                      {trial.spotsBooked >= trial.spotsAvailable ? "Fully Booked" : "Book Spot"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card text-foreground border-white/10 sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white mb-4">Book Trial: {trial.title}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Input placeholder="Player Name" required value={formData.playerName} onChange={e => setFormData({...formData, playerName: e.target.value})} className="bg-background border-white/10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-background border-white/10" />
                        <Input placeholder="Phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-background border-white/10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="bg-background border-white/10 text-muted-foreground" />
                        <Select value={formData.position} onValueChange={v => setFormData({...formData, position: v})}>
                          <SelectTrigger className="bg-background border-white/10">
                            <SelectValue placeholder="Position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Forward">Forward</SelectItem>
                            <SelectItem value="Midfielder">Midfielder</SelectItem>
                            <SelectItem value="Defender">Defender</SelectItem>
                            <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input placeholder="Additional Notes (Optional)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-background border-white/10" />
                      </div>
                      <Button type="submit" className="w-full uppercase font-bold tracking-wider rounded-none mt-2" disabled={bookTrial.isPending}>
                        {bookTrial.isPending ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}