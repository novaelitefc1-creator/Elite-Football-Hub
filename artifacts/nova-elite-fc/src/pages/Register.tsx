import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister, useListTeams } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "", password: "", firstName: "", lastName: "",
    dateOfBirth: "", position: "", nationality: "", phone: "", teamId: ""
  });
  
  const register = useRegister();
  const { data: teams } = useListTeams();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, registration would create the User, then we'd need another call for Player details.
    // For this UI mockup, we'll just send the register call with the role.
    register.mutate({ 
      data: { 
        email: formData.email, 
        password: formData.password, 
        firstName: formData.firstName, 
        lastName: formData.lastName,
        role: "player"
      } 
    }, {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        toast({ title: "Application received", description: "Your profile has been created." });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Registration failed", description: "Please check your details and try again." });
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
            src="https://images.unsplash.com/photo-1518605368461-1e1252220a22?auto=format&fit=crop&q=80&w=2000" 
            alt="Stadium" 
            className="w-full h-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
        </div>
        <div className="relative z-10 text-center px-12">
          <h1 className="text-7xl font-black uppercase tracking-tighter text-primary mb-4">Join The Elite</h1>
          <p className="text-xl text-white font-bold uppercase tracking-widest leading-relaxed">Commit to Excellence.<br/>Begin your journey today.</p>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <Link href="/login" className="inline-flex items-center text-muted-foreground hover:text-white uppercase text-xs font-bold tracking-wider mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Link>

          <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Player Application</h2>
          <p className="text-muted-foreground mb-8">Step {step} of 2: {step === 1 ? "Account Details" : "Player Profile"}</p>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</label>
                  <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="bg-card border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</label>
                  <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="bg-card border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-card border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <Input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="bg-card border-white/10" />
              </div>
              <Button type="submit" className="w-full h-12 uppercase font-bold tracking-wider text-sm rounded-none mt-4">
                Continue to Profile
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</label>
                  <Input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="bg-card border-white/10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nationality</label>
                  <Input required value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="bg-card border-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone</label>
                  <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-card border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Position</label>
                  <Select value={formData.position} onValueChange={v => setFormData({...formData, position: v})}>
                    <SelectTrigger className="bg-card border-white/10">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Forward">Forward</SelectItem>
                      <SelectItem value="Midfielder">Midfielder</SelectItem>
                      <SelectItem value="Defender">Defender</SelectItem>
                      <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Applying for Team</label>
                <Select value={formData.teamId} onValueChange={v => setFormData({...formData, teamId: v})}>
                  <SelectTrigger className="bg-card border-white/10">
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name} ({t.ageGroup})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-12 uppercase font-bold tracking-wider text-sm rounded-none border-white/20 hover:bg-white/5">
                  Back
                </Button>
                <Button type="submit" className="w-2/3 h-12 uppercase font-bold tracking-wider text-sm rounded-none" disabled={register.isPending}>
                  {register.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}