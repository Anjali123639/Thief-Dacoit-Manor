import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { generateRoomCode } from "@/lib/gameLogic";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Settings, Play, Users } from "lucide-react";

export default function CreateRoom() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState(user?.displayName || "Player");
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [totalRounds, setTotalRounds] = useState(5);
  const [customScoring, setCustomScoring] = useState(false);
  const [scores, setScores] = useState({
    babu: 1000,
    police: 800,
    chor: 600,
    dakat: 200
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      let code = generateRoomCode();
      let exists = true;
      // Ensure code is unique
      while (exists) {
        const snap = await getDoc(doc(db, "rooms", code));
        if (!snap.exists()) {
          exists = false;
        } else {
          code = generateRoomCode();
        }
      }

      await setDoc(doc(db, "rooms", code), {
        roomCode: code,
        hostId: user.uid,
        status: "waiting",
        players: [{
          uid: user.uid,
          displayName: displayName || "Unknown Player",
          score: 0,
          isHost: true,
          joinedAt: serverTimestamp()
        }],
        maxPlayers,
        currentRound: 1,
        totalRounds,
        settings: {
          totalRounds,
          scoring: scores,
          timePerRound: 60
        },
        roundScores: {},
        createdAt: serverTimestamp()
      });

      setLocation(`/lobby/${code}`);
    } catch (err: any) {
      toast({ title: "Failed to create room", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">Create Room</h1>
          <p className="text-white/50 font-medium">Set your rules and invite friends</p>
        </div>

        <form onSubmit={handleCreate} className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" /> Your Display Name
              </label>
              <input 
                type="text" 
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold text-white/70 uppercase tracking-widest flex justify-between mb-3">
                  <span>Max Players</span>
                  <span className="text-primary">{maxPlayers}</span>
                </label>
                <input 
                  type="range" 
                  min="4" max="16" 
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1 font-medium">
                  <span>4</span>
                  <span>16</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-white/70 uppercase tracking-widest flex justify-between mb-3">
                  <span>Total Rounds</span>
                  <span className="text-primary">{totalRounds}</span>
                </label>
                <input 
                  type="range" 
                  min="1" max="10" 
                  value={totalRounds}
                  onChange={e => setTotalRounds(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1 font-medium">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={customScoring}
                  onChange={e => setCustomScoring(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-black/30 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 group-hover:text-white transition-colors">
                  <Settings className="w-4 h-4 text-primary" /> Custom Scoring
                </span>
              </label>

              {customScoring && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 animate-in slide-in-from-top-2">
                  {Object.entries(scores).map(([role, score]) => (
                    <div key={role}>
                      <label className="text-xs font-bold text-white/50 uppercase mb-1 block">{role}</label>
                      <input 
                        type="number" 
                        value={score}
                        onChange={e => setScores({...scores, [role]: Number(e.target.value)})}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-primary transition-colors text-center"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(245,166,35,0.3)] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Creating..." : <><Play className="fill-current w-6 h-6" /> Start Room</>}
          </button>
        </form>
      </div>
    </Layout>
  );
}
