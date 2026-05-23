import { AppLayout } from "@/components/AppLayout";
import { useListScoutingReports, useCreateScoutingReport, getListScoutingReportsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminScouting() {
  const { data: reports, isLoading } = useListScoutingReports();
  const createReport = useCreateScoutingReport();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    playerName: "", age: 16, position: "", nationality: "", location: "", rating: 5, notes: "", potential: "", scoutedAt: new Date().toISOString().slice(0, 16)
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createReport.mutate({ data: { ...formData, age: Number(formData.age), rating: Number(formData.rating) } }, {
      onSuccess: () => {
        toast({ title: "Report submitted" });
        queryClient.invalidateQueries({ queryKey: getListScoutingReportsQueryKey() });
        setIsDialogOpen(false);
        setFormData({ playerName: "", age: 16, position: "", nationality: "", location: "", rating: 5, notes: "", potential: "", scoutedAt: new Date().toISOString().slice(0, 16) });
      }
    });
  };

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">Scouting Network</h1>
            <div className="space-x-4">
              <Link href="/admin" className="text-primary hover:text-white uppercase font-bold tracking-wider text-sm mr-4">Back to Admin</Link>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-none uppercase font-bold tracking-wider">New Report</Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white max-w-2xl">
                  <DialogHeader><DialogTitle className="uppercase font-black text-2xl">Scouting Report</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Player Name" required value={formData.playerName} onChange={e => setFormData({...formData, playerName: e.target.value})} className="bg-background border-white/10" />
                      <Input type="number" placeholder="Age" required value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="bg-background border-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Position" required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="bg-background border-white/10" />
                      <Input placeholder="Nationality" required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="bg-background border-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Location Scouted" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-background border-white/10" />
                      <Input type="datetime-local" required value={formData.scoutedAt} onChange={e => setFormData({...formData, scoutedAt: e.target.value})} className="bg-background border-white/10 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="number" min="1" max="10" placeholder="Rating (1-10)" required value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="bg-background border-white/10" />
                      <Input placeholder="Potential (A/B/C)" value={formData.potential} onChange={e => setFormData({...formData, potential: e.target.value})} className="bg-background border-white/10" />
                    </div>
                    <Textarea placeholder="Detailed Notes" required rows={6} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-background border-white/10" />
                    <Button type="submit" className="w-full rounded-none uppercase font-bold" disabled={createReport.isPending}>Submit Report</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="bg-card border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-white/5">
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Player</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Info</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Location</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Rating</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : reports?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No reports found.</TableCell></TableRow>
                ) : (
                  reports?.map((report) => (
                    <TableRow key={report.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{report.playerName}</TableCell>
                      <TableCell>{report.age} yrs • {report.position} • {report.nationality}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell>
                        <span className="text-primary font-black text-lg">{report.rating}</span>
                        <span className="text-muted-foreground text-xs ml-1">/10</span>
                        {report.potential && <span className="ml-2 bg-secondary px-2 py-0.5 text-xs uppercase font-bold">{report.potential}</span>}
                      </TableCell>
                      <TableCell>{format(new Date(report.scoutedAt), "PP")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}