import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { History as HistoryIcon, Trophy, Calendar, Users, Clock } from "lucide-react";

export default function History() {
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        // Query games where this user was a player (we can't query inside array of objects easily, so we fetch and filter, or we store an array of uids flat)
        // Since we didn't store a flat array of uids in history, we will just fetch recent and filter. In a real app, add a flat `playerUids` array to the document.
        const q = query(collection(db, "gameHistory"), orderBy("playedAt", "desc"));
        const snap = await getDocs(q);
        const myGames = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((g: any) => 
          g.players.some((p: any) => p.uid === user.uid)
        );
        setGames(myGames);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full animate-in fade-in">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
            <HistoryIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Match History</h1>
            <p className="text-white/50 font-medium">Your past games and glorious victories</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white/50 py-12">Loading...</div>
        ) : games.length === 0 ? (
          <div className="bg-card/40 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
            <HistoryIcon className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Games Played</h3>
            <p className="text-white/50">Join or create a room to start your legacy.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map(game => {
              const myStats = game.players.find((p: any) => p.uid === user.uid);
              const date = game.playedAt?.toDate() ? new Date(game.playedAt.toDate()).toLocaleDateString() : "Recent";
              const isWinner = game.winner.uid === user.uid;

              return (
                <div key={game.id} className="bg-card/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-card/60 transition-colors group">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-black bg-white/10 text-white/70 px-3 py-1 rounded-md uppercase tracking-widest border border-white/5">
                          Room {game.roomCode}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/50 font-bold">
                          <Calendar className="w-3 h-3" /> {date}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Total Score</div>
                          <div className="text-2xl font-black text-primary">{myStats.totalScore}</div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Final Role</div>
                          <div className="text-lg font-bold text-white capitalize">{myStats.role}</div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Winner</div>
                          <div className="text-lg font-bold text-white truncate flex items-center gap-1">
                            {isWinner && <Trophy className="w-4 h-4 text-primary" />}
                            {isWinner ? "You" : game.winner.displayName}
                          </div>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                          <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Players</div>
                          <div className="text-lg font-bold text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-white/50" /> {game.players.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
