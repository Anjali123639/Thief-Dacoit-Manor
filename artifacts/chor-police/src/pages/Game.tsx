import { useEffect, useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChatPanel } from "@/components/game/ChatPanel";
import { RoleCard } from "@/components/game/RoleCard";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useParams } from "wouter";
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { playSound } from "@/lib/sounds";
import { ShieldAlert, Trophy, Skull, Loader2, ArrowRight } from "lucide-react";
import Confetti from "react-confetti";

export default function Game() {
  const { user } = useAuth();
  const { roomCode } = useParams<{ roomCode: string }>();
  const [, setLocation] = useLocation();
  const [room, setRoom] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [myRole, setMyRole] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!roomCode) return;
    const code = roomCode.toUpperCase();
    const unsub = onSnapshot(doc(db, "rooms", code), (snap) => {
      if (!snap.exists()) {
        setLocation("/");
        return;
      }
      const data = snap.data();
      setRoom(data);

      if (data.status === "playing" && !showRoleReveal && !data.gameState.roundResult) {
        // Round just started
        const role = data.gameState.roles[user!.uid];
        setMyRole(role);
        setShowRoleReveal(true);
        setTimeout(() => setShowRoleReveal(false), 5000); // Show reveal for 5s

        // Start timer
        const startedAt = data.gameState.roundStartedAt?.toDate() || new Date();
        const duration = data.settings.timePerRound;
        
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
          const remaining = Math.max(0, duration - elapsed);
          setTimeLeft(remaining);

          if (remaining <= 10 && remaining > 0) {
            playSound("tick");
          }

          if (remaining === 0) {
            clearInterval(timerRef.current);
            if (data.hostId === user!.uid && data.status === "playing") {
              // Time up auto-result (Police gets 0, Chor gets points)
              handleTimeUp(data);
            }
          }
        }, 1000);
      } else if (data.status === "result" && data.gameState.roundResult) {
        clearInterval(timerRef.current);
        if (data.gameState.roundResult.correct) playSound("correct");
        else playSound("wrong");
      } else if (data.status === "ended") {
        clearInterval(timerRef.current);
        playSound("win");
      }
    });

    return () => {
      unsub();
      clearInterval(timerRef.current);
    };
  }, [roomCode, user?.uid, showRoleReveal]);

  const handleTimeUp = async (roomData: any) => {
    // Police failed to guess in time
    const resultScores: Record<string, number> = {};
    Object.entries(roomData.gameState.roles).forEach(([uid, role]) => {
      if (role === "chor") resultScores[uid] = roomData.settings.scoring.chor;
      else if (role === "police") resultScores[uid] = 0;
      else if (role === "babu") resultScores[uid] = roomData.settings.scoring.babu;
      else if (role === "dakat") resultScores[uid] = roomData.settings.scoring.dakat;
    });

    await processRoundEnd(roomData, false, resultScores);
  };

  const handleAccuse = async (suspectUid: string) => {
    if (myRole !== "police" || room.status !== "playing") return;

    const isCorrect = room.gameState.roles[suspectUid] === "chor";
    const resultScores: Record<string, number> = {};
    
    Object.entries(room.gameState.roles).forEach(([uid, role]) => {
      if (role === "babu") resultScores[uid] = room.settings.scoring.babu;
      if (role === "dakat") resultScores[uid] = room.settings.scoring.dakat;
      
      if (role === "police") {
        resultScores[uid] = isCorrect ? room.settings.scoring.police : 0;
      }
      if (role === "chor") {
        resultScores[uid] = isCorrect ? 0 : room.settings.scoring.chor;
      }
    });

    await updateDoc(doc(db, "rooms", room.roomCode), {
      "gameState.policeGuess": suspectUid
    });

    await processRoundEnd(room, isCorrect, resultScores);
  };

  const processRoundEnd = async (roomData: any, isCorrect: boolean, resultScores: Record<string, number>) => {
    // Allow any police player or host to finalize the round.
    // Guard against double-writes: skip if result already recorded.
    if (roomData.gameState?.roundResult) return;

    // Update global scores
    const newPlayers = roomData.players.map((p: any) => ({
      ...p,
      score: p.score + (resultScores[p.uid] || 0)
    }));

    await updateDoc(doc(db, "rooms", roomData.roomCode), {
      status: "result",
      players: newPlayers,
      "gameState.roundResult": {
        correct: isCorrect,
        scores: resultScores
      }
    });
  };

  const handleNextRound = async () => {
    if (room.hostId !== user!.uid) return;

    if (room.currentRound >= room.totalRounds) {
      // End game
      await updateDoc(doc(db, "rooms", room.roomCode), {
        status: "ended"
      });

      // Save to history
      const sorted = [...room.players].sort((a, b) => b.score - a.score);
      await setDoc(doc(db, "gameHistory", room.roomCode + "-" + Date.now()), {
        roomCode: room.roomCode,
        players: sorted.map(p => ({ uid: p.uid, displayName: p.displayName, totalScore: p.score, role: room.gameState.roles[p.uid] })),
        winner: { uid: sorted[0].uid, displayName: sorted[0].displayName },
        totalRounds: room.totalRounds,
        playedAt: serverTimestamp(),
        roles: room.gameState.roles
      });

      // Update user stats
      // Note: Ideally done via cloud function, doing it here for simplicity
    } else {
      // Back to lobby for next round prep
      await updateDoc(doc(db, "rooms", room.roomCode), {
        status: "waiting",
        currentRound: room.currentRound + 1,
        gameState: null
      });
    }
  };

  if (!room || !user) return null;

  const isHost = room.hostId === user.uid;

  if (showRoleReveal) {
    return (
      <Layout>
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-12 animate-in fade-in slide-in-from-top-10">Your Role Is</h2>
          <RoleCard role={myRole} reveal={true} className="scale-150 mb-12" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto h-[calc(100vh-100px)]">
        {/* Main Board */}
        <div className="flex-1 flex flex-col bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Header */}
          <div className="p-4 md:p-6 bg-black/40 border-b border-white/10 flex justify-between items-center z-10">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-primary/20 border border-primary rounded-xl font-bold text-primary">
                Round {room.currentRound} / {room.totalRounds}
              </div>
              <div className="hidden sm:block text-white/50 font-bold uppercase tracking-widest">
                Target: Find the Chor
              </div>
            </div>

            {room.status === "playing" && (
              <div className={`px-6 py-2 rounded-xl border-2 font-black text-2xl tracking-widest transition-colors ${
                timeLeft <= 10 ? "border-destructive text-destructive animate-pulse" : "border-white/20 text-white"
              }`}>
                00:{timeLeft.toString().padStart(2, "0")}
              </div>
            )}
          </div>

          {/* Active Play Area */}
          <div className="flex-1 p-6 relative overflow-y-auto">
            {room.status === "playing" && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
                    {myRole === "police" ? "Who is the Chor?" : "Police is investigating..."}
                  </h3>
                  <p className="text-white/50">
                    {myRole === "police" ? "Choose carefully. If you are wrong, the Chor steals your points." : "Act natural. Try not to look suspicious."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {room.players.map((p: any) => {
                    const isMe = p.uid === user.uid;
                    return (
                      <div key={p.uid} className={`bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center transition-all ${
                        !isMe && myRole === "police" ? "hover:bg-primary/10 hover:border-primary cursor-pointer hover:scale-105" : ""
                      }`}>
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-2xl font-black text-white mb-3">
                          {p.displayName.charAt(0)}
                        </div>
                        <span className="font-bold text-white mb-2">{p.displayName}</span>
                        {isMe && <span className="text-xs font-bold text-primary uppercase bg-primary/20 px-2 py-1 rounded">You</span>}
                        
                        {!isMe && myRole === "police" && (
                          <button 
                            onClick={() => handleAccuse(p.uid)}
                            className="w-full mt-2 bg-destructive/20 hover:bg-destructive text-destructive-foreground py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors border border-destructive/50 hover:border-destructive"
                          >
                            Accuse
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {room.status === "result" && (
              <div className="flex flex-col items-center animate-in zoom-in duration-500 max-w-4xl mx-auto">
                <div className={`px-8 py-4 rounded-2xl border-4 font-black text-4xl uppercase tracking-widest mb-12 shadow-2xl ${
                  room.gameState.roundResult.correct 
                    ? "bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                    : "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
                }`}>
                  {room.gameState.roundResult.correct ? "Police Caught The Chor!" : "Wrong! Chor Escaped!"}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-12">
                  {room.players.map((p: any) => {
                    const role = room.gameState.roles[p.uid];
                    const pts = room.gameState.roundResult.scores[p.uid] || 0;
                    return (
                      <div key={p.uid} className="flex flex-col items-center gap-4">
                        <RoleCard role={role} reveal={false} className="scale-75 origin-top" />
                        <div className="text-center -mt-8">
                          <div className="font-bold text-white truncate max-w-[120px]">{p.displayName}</div>
                          <div className={`text-2xl font-black ${pts > 0 ? "text-green-400" : "text-white/30"}`}>
                            +{pts}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isHost && (
                  <button 
                    onClick={handleNextRound}
                    className="bg-primary text-primary-foreground py-4 px-12 rounded-full font-black text-xl uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(245,166,35,0.4)]"
                  >
                    {room.currentRound >= room.totalRounds ? "View Final Results" : "Next Round"} <ArrowRight className="inline ml-2" />
                  </button>
                )}
                {!isHost && (
                  <div className="text-white/50 font-bold uppercase tracking-widest animate-pulse">
                    Waiting for host...
                  </div>
                )}
              </div>
            )}

            {room.status === "ended" && (
              <div className="flex flex-col items-center animate-in zoom-in duration-700">
                <Confetti width={window.innerWidth} height={window.innerHeight} colors={['#F5A623', '#2D0854', '#ffffff']} />
                
                <Trophy className="w-32 h-32 text-primary mb-6 drop-shadow-[0_0_30px_rgba(245,166,35,0.6)]" />
                <h2 className="text-5xl font-black uppercase text-white mb-2">Game Over</h2>
                <p className="text-xl text-primary font-bold mb-12">Final Standings</p>

                <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-2xl overflow-hidden mb-8">
                  {[...room.players].sort((a, b) => b.score - a.score).map((p: any, i: number) => (
                    <div key={p.uid} className={`flex items-center justify-between p-4 border-b border-white/5 ${i === 0 ? "bg-primary/20" : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${i === 0 ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/50"}`}>
                          {i + 1}
                        </div>
                        <span className="font-bold text-white text-lg">{p.displayName}</span>
                        {p.uid === user.uid && <span className="text-xs font-bold text-primary uppercase bg-primary/20 px-2 py-1 rounded">You</span>}
                      </div>
                      <div className="text-2xl font-black text-primary">{p.score}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setLocation("/")}
                    className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-full font-bold uppercase tracking-wider transition-colors border border-white/20"
                  >
                    Home
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Absolute self role indicator when playing */}
          {room.status === "playing" && (
            <div className="absolute bottom-6 left-6 z-20 hidden md:block">
              <div className="text-xs font-bold text-white/50 uppercase mb-2">You are</div>
              <RoleCard role={myRole} reveal={false} className="scale-[0.6] origin-bottom-left" />
            </div>
          )}
        </div>

        {/* Side Panel (Chat & Scoreboard) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 h-[400px] lg:h-full">
          <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
            <h3 className="text-sm font-black text-white/70 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Scores</h3>
            <div className="space-y-2">
              {[...room.players].sort((a, b) => b.score - a.score).map((p: any) => (
                <div key={p.uid} className="flex justify-between items-center">
                  <span className={`text-sm font-bold ${p.uid === user.uid ? "text-primary" : "text-white"}`}>{p.displayName}</span>
                  <span className="text-sm font-mono text-white/70">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
          
          <ChatPanel roomCode={room.roomCode} className="flex-1 min-h-0" />
        </div>
      </div>
    </Layout>
  );
}
