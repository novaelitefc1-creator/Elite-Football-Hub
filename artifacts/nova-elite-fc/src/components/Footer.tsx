import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold tracking-tighter text-primary uppercase">
                NOVA ELITE
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Forging the next generation of elite footballers. A premier academy dedicated to technical excellence, tactical intelligence, and uncompromising discipline.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">Academy</Link></li>
              <li><Link href="/programs" className="text-muted-foreground hover:text-primary transition-colors">Programs</Link></li>
              <li><Link href="/trials" className="text-muted-foreground hover:text-primary transition-colors">Open Trials</Link></li>
              <li><Link href="/teams" className="text-muted-foreground hover:text-primary transition-colors">Teams</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>1 Elite Way, Football District</li>
              <li>London, UK</li>
              <li>contact@novaelite.fc</li>
              <li>+44 (0) 20 7123 4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Nova Elite FC Academy. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
