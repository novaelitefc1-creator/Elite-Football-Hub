import { AppLayout } from "@/components/AppLayout";
import { useSendContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const sendContact = useSendContact();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "", message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendContact.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Message Sent", description: "We have received your message and will respond shortly." });
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to send message. Please try again." });
      }
    });
  };

  return (
    <AppLayout>
      <div className="pt-32 pb-20 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 text-white">Get in <span className="text-primary">Touch</span></h1>
              <p className="text-muted-foreground text-lg mb-12">
                Have questions about trials, programs, or academy facilities? Contact our administrative team.
              </p>

              <div className="space-y-8 mb-12">
                <div className="flex items-start">
                  <div className="bg-secondary p-3 text-primary mr-4 border border-white/5">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-white mb-1">Academy Headquarters</h3>
                    <p className="text-muted-foreground">1 Elite Way, Football District<br/>London, UK</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-secondary p-3 text-primary mr-4 border border-white/5">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-white mb-1">Phone</h3>
                    <p className="text-muted-foreground">+44 (0) 20 7123 4567<br/>Mon-Fri, 9am - 6pm</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-secondary p-3 text-primary mr-4 border border-white/5">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-white mb-1">Email</h3>
                    <p className="text-muted-foreground">contact@novaelite.fc<br/>admissions@novaelite.fc</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <h3 className="font-bold uppercase tracking-wider text-white mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-secondary p-3 text-white hover:text-primary hover:bg-white/5 transition-colors border border-white/5"><Instagram className="w-5 h-5" /></a>
                  <a href="#" className="bg-secondary p-3 text-white hover:text-primary hover:bg-white/5 transition-colors border border-white/5"><Twitter className="w-5 h-5" /></a>
                  <a href="#" className="bg-secondary p-3 text-white hover:text-primary hover:bg-white/5 transition-colors border border-white/5"><Facebook className="w-5 h-5" /></a>
                </div>
              </div>
            </div>

            <div className="bg-card border border-white/10 p-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                    <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-background border-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</label>
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-background border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
                    <Input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="bg-background border-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</label>
                  <Textarea required rows={6} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="bg-background border-white/10 resize-none" />
                </div>
                <Button type="submit" className="w-full h-12 uppercase font-bold tracking-wider text-sm rounded-none" disabled={sendContact.isPending}>
                  {sendContact.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}