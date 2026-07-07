import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Users, LogIn } from "lucide-react";

export default function JoinRoom() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [roomCode, setRoomCode] = useState("");
  const [displayName, setDisplayName] = useState(user?.displayName || "Player");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const code = roomCode.trim().toUpperCase();
    if (code.length !== 6) {
      toast({ title: "Invalid Code", description: "Room code must be 6 characters long.", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    try {
      const roomRef = doc(db, "rooms", code);
      const snap = await getDoc(roomRef);
      
      if (!snap.exists()) {
        throw new Error("Room not found");
      }
      
      const room = snap.data();
      
      if (room.status !== "waiting") {
        throw new Error("Game has already started or ended");
      }
      
      if (room.players.length >= room.maxPlayers) {
        throw new Error("Room is full");
      }
      
      const isAlreadyInRoom = room.players.some((p: any) => p.uid === user.uid);
      
      if (!isAlreadyInRoom) {
        await updateDoc(roomRef, {
          players: arrayUnion({
            uid: user.uid,
            displayName: displayName || "Unknown Player",
            score: 0,
            isHost: false,
            joinedAt: new Date()
          })
        });
      }

      setLocation(`/lobby/${code}`);
    } catch (err: any) {
      toast({ title: "Failed to join", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/30">
            <Users className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-2">Join Room</h1>
          <p className="text-white/50 font-medium">Enter the 6-character room code</p>
        </div>

        <form onSubmit={handleJoin} className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest mb-3 block">
                Room Code
              </label>
              <input 
                type="text" 
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-5 text-white text-3xl font-black tracking-[0.5em] text-center focus:outline-none focus:border-secondary transition-colors uppercase placeholder:text-white/10"
                placeholder="XXXXXX"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest mb-3 block">
                Your Display Name
              </label>
              <input 
                type="text" 
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold focus:outline-none focus:border-secondary transition-colors text-center"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || roomCode.length < 6}
            className="w-full bg-secondary text-secondary-foreground py-5 rounded-2xl font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(208,62,255,0.3)] disabled:opacity-50 disabled:hover:scale-100 mt-8"
          >
            {loading ? "Joining..." : <><LogIn className="w-6 h-6" /> Join Game</>}
          </button>
        </form>
      </div>
    </Layout>
  );
}
