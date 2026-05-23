import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useGetMe } from "@workspace/api-client-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const { data: user } = useGetMe();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/about", label: "Academy" },
    { href: "/programs", label: "Programs" },
    { href: "/teams", label: "Teams" },
    { href: "/trials", label: "Trials" },
    { href: "/news", label: "News" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-black/80 backdrop-blur-md border-primary/20"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tighter text-primary uppercase">
              NOVA ELITE
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pl-4 border-l border-white/10 flex items-center space-x-4">
              {user ? (
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="text-sm font-medium uppercase tracking-wider text-primary hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium uppercase tracking-wider text-white hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-primary/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 text-base font-medium uppercase tracking-wider ${
                  location === link.href ? "text-primary" : "text-white hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-medium uppercase tracking-wider text-primary hover:text-white"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-medium uppercase tracking-wider text-white hover:text-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
