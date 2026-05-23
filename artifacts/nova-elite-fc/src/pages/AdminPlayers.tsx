import { AppLayout } from "@/components/AppLayout";
import { useListPlayers, useUpdatePlayer, useDeletePlayer, getListPlayersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Link } from "wouter";

export default function AdminPlayers() {
  const { data: players, isLoading } = useListPlayers();
  const updatePlayer = useUpdatePlayer();
  const deletePlayer = useDeletePlayer();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updatePlayer.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: "Player updated", description: `Status changed to ${newStatus}` });
        queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this player?")) {
      deletePlayer.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Player deleted" });
          queryClient.invalidateQueries({ queryKey: getListPlayersQueryKey() });
        }
      });
    }
  };

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">Manage Players</h1>
            <Link href="/admin" className="text-primary hover:text-white uppercase font-bold tracking-wider text-sm">Back to Admin</Link>
          </div>

          <div className="bg-card border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-white/5">
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Name</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Position</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Nationality</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Status</TableHead>
                  <TableHead className="text-right text-white uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : players?.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No players found.</TableCell></TableRow>
                ) : (
                  players?.map((player) => (
                    <TableRow key={player.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{player.user?.firstName} {player.user?.lastName}</TableCell>
                      <TableCell>{player.position}</TableCell>
                      <TableCell>{player.nationality}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider ${player.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}`}>
                          {player.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(player.id, player.status)} className="border-white/10 hover:bg-white/10 rounded-none h-8">
                          Toggle Status
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(player.id)} className="rounded-none h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
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