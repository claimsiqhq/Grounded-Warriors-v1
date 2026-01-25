import { Link, useLocation } from "wouter";
import { images } from "@/lib/data";
import { Menu, User, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { MiniCountdown } from "@/components/countdown";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/about", label: "The Work" },
    { href: "/retreats", label: "Retreats" },
    { href: "/past-retreats", label: "Past Retreats" },
    { href: "/faq", label: "FAQ" },
    { href: "/team", label: "Team" },
    { href: "/contact", label: "Contact" },
  ];

  const nextRetreatDate = new Date("2026-03-06");
  const isHomePage = location === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-white/5" : "bg-transparent"
      }`}
    >
      {/* Mobile countdown banner */}
      {isHomePage && (
        <div className="md:hidden">
          <MiniCountdown targetDate={nextRetreatDate} variant="mobile" />
        </div>
      )}
      <div className={`container mx-auto px-6 flex items-center justify-between ${scrolled ? "py-4" : "py-6"}`}>
        <Link href="/" className="flex items-center gap-3 group">
            <img 
              src={images.logo} 
              alt="Grounded Warriors" 
              className="h-10 w-10 object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
            />
            <span className="font-serif text-xl tracking-widest uppercase font-semibold text-foreground hidden sm:block">
              Grounded Warriors
            </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm tracking-widest uppercase hover:text-white transition-colors duration-300 ${
                  location === link.href ? "text-white border-b border-primary" : "text-muted-foreground"
                }`}>
                {link.label}
            </Link>
          ))}
          {isHomePage && (
            <MiniCountdown targetDate={nextRetreatDate} />
          )}
          
          {/* Auth buttons */}
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-3 ml-2">
                <Link href="/member">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-white" data-testid="button-member-portal">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Portal
                  </Button>
                </Link>
              </div>
            ) : (
              <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-white ml-2" data-testid="button-login">
                <a href="/api/login">
                  <LogIn className="w-4 h-4" />
                  Log In
                </a>
              </Button>
            )
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-white/10 w-full sm:w-[400px] p-0">
               <div className="flex flex-col h-full bg-background relative overflow-hidden">
                 {/* Decorative background logo */}
                 <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
                    <img src={images.logo} className="w-96 h-96 invert" />
                 </div>

                 <div className="p-8 flex justify-end">
                 </div>
                 
                 <div className="flex flex-col justify-center items-center gap-6 flex-1 z-10">
                  {links.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link 
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="font-serif text-3xl text-foreground hover:text-white transition-colors block py-2 px-4">
                          {link.label}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Mobile Auth */}
                  {!isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: links.length * 0.1 }}
                      className="pt-4 border-t border-white/10 mt-4"
                    >
                      {user ? (
                        <div className="flex flex-col items-center gap-4">
                          <Link href="/member" onClick={() => setIsOpen(false)}>
                            <span className="font-serif text-2xl text-primary hover:text-white transition-colors block py-2 px-4">
                              Member Portal
                            </span>
                          </Link>
                          <a href="/api/logout" className="text-muted-foreground hover:text-white text-sm flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </a>
                        </div>
                      ) : (
                        <a href="/api/login" className="font-serif text-2xl text-primary hover:text-white transition-colors block py-2 px-4 flex items-center gap-3">
                          <LogIn className="w-6 h-6" />
                          Log In
                        </a>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-card py-20 border-t border-white/5 relative overflow-hidden">
      {/* Texture overlay could go here */}
      <div className="container mx-auto px-6 text-center">
        <img 
          src={images.badge} 
          alt="Grounded Warriors Badge" 
          className="h-24 w-24 mx-auto mb-8 opacity-80 hover:opacity-100 transition-opacity invert" 
        />
        
        <h3 className="font-serif text-2xl md:text-3xl text-white mb-2 tracking-wide">
          Grounded Warriors
        </h3>
        <p className="text-primary italic text-lg mb-8">
          Return to the Elements. Return to Yourself.
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12 text-muted-foreground text-sm tracking-widest uppercase">
          <Link href="/about"><span className="hover:text-white transition-colors cursor-pointer block py-2 px-2">The Work</span></Link>
          <Link href="/retreats"><span className="hover:text-white transition-colors cursor-pointer block py-2 px-2">Retreats</span></Link>
          <Link href="/past-retreats"><span className="hover:text-white transition-colors cursor-pointer block py-2 px-2">Past Retreats</span></Link>
          <Link href="/faq"><span className="hover:text-white transition-colors cursor-pointer block py-2 px-2">FAQ</span></Link>
          <Link href="/contact"><span className="hover:text-white transition-colors cursor-pointer block py-2 px-2">Contact</span></Link>
        </div>

        <div className="text-white/20 text-xs">
          &copy; {new Date().getFullYear()} Grounded Warriors. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-white">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
