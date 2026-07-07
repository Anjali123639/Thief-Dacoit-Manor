import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import logoPath from "@assets/WhatsApp_Image_2026-07-04_at_2.14.34_PM_(1)_1783419550082.jpeg";
import { Play, Users, Trophy } from "lucide-react";

export default function Landing() {
  const { user, loading } = useAuth();

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] animate-in fade-in zoom-in duration-700">
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-primary/30 blur-[100px] rounded-full group-hover:bg-primary/40 transition-colors duration-500" />
          <img 
            src={logoPath} 
            alt="Chor Police Logo" 
            className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-3xl shadow-[0_0_40px_rgba(245,166,35,0.3)] border border-white/10 animate-float"
          />
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-center uppercase tracking-tighter leading-none mb-4 drop-shadow-lg">
          <span className="text-white">Chor </span>
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-br from-primary to-orange-600">Police</span>
          <br/>
          <span className="text-3xl md:text-5xl text-secondary">Dakat Babu</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 text-center max-w-lg mb-12 font-medium">
          The ultimate bluffing game of deduction, deceit, and points! Gather 4-16 friends and find the Chor before they steal your score.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          <Link 
            href={user ? "/create" : "/auth"} 
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 px-8 rounded-full font-black text-lg uppercase tracking-wider hover:scale-105 transition-transform shadow-[0_0_20px_rgba(245,166,35,0.4)]"
          >
            <Play className="fill-current w-5 h-5" />
            Create Room
          </Link>
          <Link 
            href={user ? "/join" : "/auth"} 
            className="w-full flex items-center justify-center gap-3 bg-white/10 text-white border border-white/20 py-4 px-8 rounded-full font-black text-lg uppercase tracking-wider hover:bg-white/20 hover:scale-105 transition-all"
          >
            <Users className="w-5 h-5" />
            Join Room
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl px-4">
          {["Babu", "Police", "Chor", "Dakat"].map((role, i) => (
            <div key={role} className="bg-card/40 border border-white/5 rounded-2xl p-4 text-center backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">Role</div>
              <div className="text-xl font-black text-white">{role}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
