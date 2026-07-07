import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChatPanel } from "@/components/game/ChatPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useParams } from "wouter";
import { doc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { playSound } from "@/lib/sounds";
import { Copy, Check, Users, Shield, Clock, Play, LogOut, Loader2 } from "lucide-react";
import { distributeRoles } from "@/lib/gameLogic";

export default function Lobby() {
  const { user } = useAuth();
  const { roomCode } = useParams<{ roomCode: string }>();
  const [, setLocation] = useLocation();
  
  const [room, setRoom] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    const unsub = onSnapshot(doc(db, "rooms", roomCode.toUpperCase()), (snap) => {
      if (!snap.exists()) {
        setLocation("/");
        return;
      }
      const data = snap.data();
      
      // If someone new joins, play sound
      if (room && data.players.length > room.players.length) {
        playSound("join");
      }
      
      setRoom(data);
      
      if (data.status === "playing" || data.status === "result") {
        setLocation(`/game/${roomCode.toUpperCase()}`);
      }
    });
    return unsub;
  }, [roomCode, location]);

  if (!room || !user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  const isHost = room.hostId === user.uid;
  const canStart = isHost && room.players.length >= 4;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode!.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    try {
      const uids = room.players.map((p: any) => p.uid);
      const roles = distributeRoles(uids, uids.length);
      
      await updateDoc(doc(db, "rooms", roomCode!.toUpperCase()), {
        status: "playing",
        gameState: {
          roles,
          roundStartedAt: new Date()
        }
      });
      // Component will unmount and redirect via listener
    } catch (err) {
      console.error(err);
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    const playerRecord = room.players.find((p: any) => p.uid === user.uid);
    if (playerRecord) {
      await updateDoc(doc(db, "rooms", roomCode!.toUpperCase()), {
        players: arrayRemove(playerRecord)
      });
    }
    setLocation("/");
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto h-[calc(100vh-140px)]">
        {/* Main Panel */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">Room Code</div>
            <div 
              onClick={handleCopy}
              className="flex items-center gap-4 bg-black/40 border border-white/10 px-8 py-4 rounded-2xl cursor-pointer hover:bg-black/60 transition-colors group mb-6"
            >
              <span className="text-5xl font-black tracking-[0.3em] text-white group-hover:text-primary transition-colors">{roomCode!.toUpperCase()}</span>
              {copied ? <Check className="w-8 h-8 text-green-500" /> : <Copy className="w-8 h-8 text-white/40 group-hover:text-primary" />}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-white/80">
                <Users className="w-4 h-4 text-primary" /> {room.players.length} / {room.maxPlayers} Players
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-white/80">
                <Clock className="w-4 h-4 text-primary" /> {room.settings.totalRounds} Rounds
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-white/80">
                <Shield className="w-4 h-4 text-primary" /> Custom Scoring: {room.settings.scoring.babu} | {room.settings.scoring.police} | {room.settings.scoring.chor} | {room.settings.scoring.dakat}
              </div>
            </div>

            <div className="w-full flex gap-4">
              <button 
                onClick={handleLeave}
                className="flex-1 bg-white/5 hover:bg-destructive/20 text-white/80 hover:text-destructive border border-white/10 hover:border-destructive py-4 rounded-2xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" /> Leave
              </button>
              
              {isHost ? (
                <button 
                  onClick={handleStart}
                  disabled={!canStart || starting}
                  className="flex-[2] bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(245,166,35,0.3)] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {starting ? "Starting..." : <><Play className="fill-current w-5 h-5" /> Start Game</>}
                </button>
              ) : (
                <div className="flex-[2] bg-black/40 border border-white/10 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center text-white/50">
                  Waiting for host...
                </div>
              )}
            </div>
            
            {isHost && !canStart && (
              <p className="text-destructive mt-4 text-sm font-bold">Need at least 4 players to start</p>
            )}
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex-1 overflow-hidden flex flex-col">
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Players ({room.players.length})
            </h3>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
              {room.players.map((p: any) => (
                <div key={p.uid} className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center gap-3 animate-in zoom-in">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold shadow-[0_0_10px_rgba(245,166,35,0.2)]">
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">{p.displayName}</div>
                    {p.isHost && <div className="text-[10px] text-primary uppercase font-black tracking-wider">Host</div>}
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, room.maxPlayers - room.players.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white/5 border border-white/10 border-dashed rounded-xl p-3 flex items-center justify-center">
                  <span className="text-white/20 text-sm font-bold uppercase">Empty</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-full lg:w-80 h-[400px] lg:h-full flex-shrink-0">
          <ChatPanel roomCode={roomCode!.toUpperCase()} className="h-full" />
        </div>
      </div>
    </Layout>
  );
}
