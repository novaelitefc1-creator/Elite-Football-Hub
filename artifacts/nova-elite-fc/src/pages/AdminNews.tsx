import { AppLayout } from "@/components/AppLayout";
import { useListNews, useCreateNews, useDeleteNews, getListNewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminNews() {
  const { data: news, isLoading } = useListNews();
  const createNews = useCreateNews();
  const deleteNews = useDeleteNews();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "", content: "", category: "Announcement", excerpt: "", imageUrl: ""
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createNews.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "News published" });
        queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
        setIsDialogOpen(false);
        setFormData({ title: "", content: "", category: "Announcement", excerpt: "", imageUrl: "" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteNews.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Article deleted" });
          queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
        }
      });
    }
  };

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white">Manage News</h1>
            <div className="space-x-4">
              <Link href="/admin" className="text-primary hover:text-white uppercase font-bold tracking-wider text-sm mr-4">Back to Admin</Link>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-none uppercase font-bold tracking-wider">Publish Article</Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-white max-w-2xl">
                  <DialogHeader><DialogTitle className="uppercase font-black text-2xl">New Article</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <Input placeholder="Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-background border-white/10" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-background border-white/10" />
                      <Input placeholder="Image URL (optional)" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="bg-background border-white/10" />
                    </div>
                    <Textarea placeholder="Excerpt (short summary)" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="bg-background border-white/10" />
                    <Textarea placeholder="Full Content" required rows={10} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="bg-background border-white/10" />
                    <Button type="submit" className="w-full rounded-none uppercase font-bold" disabled={createNews.isPending}>Publish</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="bg-card border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-white/5">
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Title</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Category</TableHead>
                  <TableHead className="text-white uppercase tracking-wider text-xs font-bold">Date</TableHead>
                  <TableHead className="text-right text-white uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : news?.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No articles found.</TableCell></TableRow>
                ) : (
                  news?.map((item) => (
                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white max-w-md truncate">{item.title}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{format(new Date(item.createdAt), "PP")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)} className="rounded-none h-8 w-8">
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