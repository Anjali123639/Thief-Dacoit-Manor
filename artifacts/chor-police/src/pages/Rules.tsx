import { Layout } from "@/components/layout/Layout";
import { BookOpen, ShieldAlert, Crown, Skull } from "lucide-react";

export default function Rules() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto w-full animate-in fade-in pb-20">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30 shadow-[0_0_30px_rgba(245,166,35,0.2)]">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">How to Play</h1>
          <p className="text-xl text-white/60 font-medium">The ultimate game of deduction and deceit.</p>
        </div>

        <div className="space-y-8">
          <section className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
              The Setup
            </h2>
            <p className="text-white/70 leading-relaxed font-medium text-lg">
              Gather 4 to 16 players in a room. In each round, every player is secretly assigned a role. Your goal depends on your role, but the core conflict is always between the <strong className="text-blue-400">Police</strong> and the <strong className="text-red-400">Chor</strong> (Thief).
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden group">
              <Crown className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/20 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black text-amber-500 uppercase tracking-widest mb-2 relative z-10">Babu (The VIP)</h3>
              <p className="text-white/70 font-medium relative z-10">You are safe. Sit back, act natural, and collect your guaranteed high points. Don't act suspicious or the Police might guess you!</p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group">
              <ShieldAlert className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/20 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black text-blue-400 uppercase tracking-widest mb-2 relative z-10">Police</h3>
              <p className="text-white/70 font-medium relative z-10">Your job is to identify the Chor from the player list before time runs out. Guess correctly to earn points. Guess wrong, and you get nothing.</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-9xl text-red-500/20 group-hover:scale-110 transition-transform font-black">?</div>
              <h3 className="text-xl font-black text-red-400 uppercase tracking-widest mb-2 relative z-10">Chor (Thief)</h3>
              <p className="text-white/70 font-medium relative z-10">Hide in plain sight. If the Police guesses someone else, you steal the Police's points! If they guess you, you get 0.</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden group">
              <Skull className="absolute -right-4 -bottom-4 w-32 h-32 text-purple-500/20 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black text-purple-400 uppercase tracking-widest mb-2 relative z-10">Dakat (Robber)</h3>
              <p className="text-white/70 font-medium relative z-10">The wildcard. You get a guaranteed small amount of points every round regardless of what happens.</p>
            </div>
          </section>

          <section className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
              Scoring System
            </h2>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/60 font-sans font-bold">Police Guesses <span className="text-green-400">CORRECTLY</span></span>
                <div className="text-right">
                  <div className="text-blue-400">Police gets Full Points</div>
                  <div className="text-red-400">Chor gets 0 Points</div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-white/60 font-sans font-bold">Police Guesses <span className="text-red-400">WRONG</span></span>
                <div className="text-right">
                  <div className="text-blue-400">Police gets 0 Points</div>
                  <div className="text-red-400">Chor STEALS Full Points</div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm text-primary font-bold uppercase tracking-widest text-center">
              The player with the highest total score after all rounds wins!
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
