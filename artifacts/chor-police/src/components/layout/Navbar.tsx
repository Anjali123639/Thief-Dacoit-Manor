import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Home, BookOpen, History as HistoryIcon } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import logoPath from "@assets/WhatsApp_Image_2026-07-04_at_2.14.34_PM_(1)_1783419550082.jpeg";

export function Navbar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const handleSignOut = async () => {
    await signOut(auth);
    setLocation("/");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-card/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
            <img src={logoPath} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-black text-xl tracking-tight text-white uppercase drop-shadow-md">
            Chor <span className="text-primary">Police</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link href="/rules" className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Rules
          </Link>
          {user && (
            <Link href="/history" className="text-sm font-semibold text-white/70 hover:text-primary transition-colors flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" /> History
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ""} className="w-full h-full object-cover" />
                  ) : (
                    user.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-bold text-white hidden lg:block">
                  {user.displayName?.split(" ")[0] || "Player"}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-destructive transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/auth" className="px-5 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-[0_0_15px_rgba(245,166,35,0.3)] hover:scale-105 transition-transform">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/10 z-50 px-6 py-3 flex justify-between items-center pb-safe">
        <Link href="/" className={`flex flex-col items-center gap-1 ${location === "/" ? "text-primary" : "text-white/50"}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/rules" className={`flex flex-col items-center gap-1 ${location === "/rules" ? "text-primary" : "text-white/50"}`}>
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold">Rules</span>
        </Link>
        {user && (
          <Link href="/history" className={`flex flex-col items-center gap-1 ${location === "/history" ? "text-primary" : "text-white/50"}`}>
            <HistoryIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold">History</span>
          </Link>
        )}
        {user ? (
          <Link href="/profile" className={`flex flex-col items-center gap-1 ${location === "/profile" ? "text-primary" : "text-white/50"}`}>
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        ) : (
          <Link href="/auth" className={`flex flex-col items-center gap-1 ${location === "/auth" ? "text-primary" : "text-white/50"}`}>
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Login</span>
          </Link>
        )}
      </div>
    </>
  );
}
