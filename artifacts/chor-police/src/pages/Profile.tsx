import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { User, Trophy, Gamepad2, Settings } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ gamesPlayed: 0, wins: 0, totalScore: 0 });
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      getDoc(doc(db, "users", user.uid)).then(snap => {
        if (snap.exists()) {
          setStats(snap.data().stats || { gamesPlayed: 0, wins: 0, totalScore: 0 });
        }
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName });
      toast({ title: "Profile updated successfully" });
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto w-full animate-in fade-in pb-20">
        <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center text-primary font-black text-5xl shadow-[0_0_30px_rgba(245,166,35,0.3)]">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase() || "P"
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{displayName || "Unknown Player"}</h1>
              <p className="text-white/50 font-medium mb-4">{user.email || "Guest Account"}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-black/30 border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-3">
                  <Gamepad2 className="w-6 h-6 text-secondary" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Games</div>
                    <div className="text-xl font-black text-white">{stats.gamesPlayed}</div>
                  </div>
                </div>
                <div className="bg-black/30 border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-primary" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Wins</div>
                    <div className="text-xl font-black text-white">{stats.wins}</div>
                  </div>
                </div>
                <div className="bg-black/30 border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Total Score</div>
                    <div className="text-xl font-black text-white">{stats.totalScore}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Settings
          </h2>
          
          <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1 mb-1 block">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-primary text-primary-foreground py-3 px-8 rounded-xl font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
