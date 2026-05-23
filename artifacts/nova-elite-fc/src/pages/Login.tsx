import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        toast({ title: "Login successful", description: "Welcome back to Nova Elite." });
        setLocation(data.user.role === "admin" ? "/admin" : "/dashboard");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Login failed", description: "Invalid credentials. Please try again." });
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img 
            src="https://images.unsplash.com/photo-1431324155629-1a6bbe1dc5b1?auto=format&fit=crop&q=80&w=2000" 
            alt="Stadium" 
            className="w-full h-full object-cover opacity-30 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
        </div>
        <div className="relative z-10 text-center px-12">
          <h1 className="text-7xl font-black uppercase tracking-tighter text-primary mb-4">Nova Elite</h1>
          <p className="text-2xl text-white font-bold uppercase tracking-widest">Portal Access</p>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-white uppercase text-xs font-bold tracking-wider mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Website
          </Link>

          <h2 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Sign In</h2>
          <p className="text-muted-foreground mb-8">Access your academy dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="bg-card border-white/10 h-12" 
                placeholder="player@novaelite.fc"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <a href="#" className="text-xs font-bold uppercase tracking-wider text-primary hover:text-white transition-colors">Forgot?</a>
              </div>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="bg-card border-white/10 h-12" 
                placeholder="••••••••"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 uppercase font-bold tracking-wider text-sm rounded-none mt-4" 
              disabled={login.isPending}
            >
              {login.isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-12 text-center border-t border-white/10 pt-8">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-bold uppercase tracking-wider hover:text-white transition-colors">
                Apply Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}