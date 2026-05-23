import { AppLayout } from "@/components/AppLayout";
import { useListTrials, useCreateTrial, useListTrialBookings, useUpdateTrialBooking, getListTrialsQueryKey, getListTrialBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminTrials() {
  const { data: trials, isLoading: trialsLoading } = useListTrials();
  const { data: bookings, isLoading: bookingsLoading } = useListTrialBookings();
  const createTrial = useCreateTrial();
  const updateBooking = useUpdateTrialBooking();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "", date: "", location: "", ageGroup: "", spotsAvailable: 20, description: ""
  });

  const handleCreateTrial = (e: React.FormEvent) => {
    e.preventDefault();
    createTrial.mutate({ data: { ...formData, spotsAvailable: Number(formData.spotsAvailable) } }, {
      onSuccess: () => {
        toast({ title: "Trial created successfully" });
        queryClient.invalidateQueries({ queryKey: getListTrialsQueryKey() });
        setIsDialogOpen(false);
        setFormData({ title: "", date: "", location: "", ageGroup: "", spotsAvailable: 20, description: "" });
      }
    });
  };

  const handleBookingStatus = (id: number, status: string) => {
    updateBooking.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Booking status updated" });
        queryClient.invalidateQueries({ queryKey: getListTrialBookingsQueryKey() });
      }
    });
  };

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">Manage Trials</h1>
            <div className="space-x-4">
              <Link href="/admin" className="text-primary hover:text-white uppercase font-bold tracking-wider text-sm mr-4">Back to Admin</Link>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-none uppercase font-bold tracking-wider">Create Trial</Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white">
                  <DialogHeader><DialogTitle className="uppercase font-black text-2xl">New Trial Session</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateTrial} className="space-y-4">
                    <Input placeholder="Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background border-white/10" />
                    <Input type="datetime-local" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-background border-white/10 text-muted-foreground" />
                    <Input placeholder="Location" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background border-white/10" />
                    <Input placeholder="Age Group (e.g. U18)" required value={formData.ageGroup} onChange={e => setFormData({...formData, ageGroup: e.target.value})} className="bg-background border-white/10" />
                    <Input type="number" placeholder="Spots" required value={formData.spotsAvailable} onChange={e => setFormData({...formData, spotsAvailable: Number(e.target.value)})} className="bg-background border-white/10" />
                    <Input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background border-white/10" />
                    <Button type="submit" className="w-full rounded-none uppercase font-bold" disabled={createTrial.isPending}>Save</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-4 mt-8">Recent Bookings</h2>
          <div className="bg-card border border-white/10 overflow-hidden mb-12">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-white/5">
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Player</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Trial</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Date</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Status</TableHead>
                  <TableHead className="text-right text-white uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : bookings?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No bookings found.</TableCell></TableRow>
                ) : (
                  bookings?.map((booking) => {
                    const trial = trials?.find(t => t.id === booking.trialId);
                    return (
                      <TableRow key={booking.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-medium text-white">{booking.playerName}<br/><span className="text-xs text-muted-foreground">{booking.email}</span></TableCell>
                        <TableCell>{trial?.title}</TableCell>
                        <TableCell>{format(new Date(booking.createdAt || Date.now()), "PP")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-primary/20 text-primary' : booking.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleBookingStatus(booking.id, "confirmed")} className="border-white/10 hover:bg-primary hover:text-black rounded-none h-8">Approve</Button>
                          <Button variant="outline" size="sm" onClick={() => handleBookingStatus(booking.id, "rejected")} className="border-white/10 hover:bg-red-500 hover:text-white rounded-none h-8">Reject</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}