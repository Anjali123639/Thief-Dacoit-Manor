import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInAnonymously, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/WhatsApp_Image_2026-07-04_at_2.14.34_PM_(1)_1783419550082.jpeg";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleUserSetup = async (user: any, nameStr: string) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: nameStr || user.displayName || "Unknown Player",
        email: user.email || "",
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        stats: { gamesPlayed: 0, wins: 0, totalScore: 0 },
        friends: [],
        friendRequests: []
      });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name.trim()) throw new Error("Name is required");
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await handleUserSetup(res.user, name);
      }
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await handleUserSetup(res.user, res.user.displayName || "Player");
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Google Auth Failed", description: err.message, variant: "destructive" });
    }
  };

  const onGuest = async () => {
    try {
      const res = await signInAnonymously(auth);
      await updateProfile(res.user, { displayName: "Unknown Friend" });
      await handleUserSetup(res.user, "Unknown Friend");
      setLocation("/");
    } catch (err: any) {
      toast({ title: "Guest Auth Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-120px)] animate-in fade-in">
        <div className="w-full max-w-md bg-card/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/20 blur-[50px] rounded-full" />
          
          <div className="flex justify-center mb-6">
            <img src={logoPath} alt="Logo" className="w-16 h-16 rounded-xl shadow-lg border border-white/10" />
          </div>
          
          <h2 className="text-3xl font-black text-center text-white mb-2 uppercase tracking-tight">
            {isLogin ? "Welcome Back" : "Join the Game"}
          </h2>
          <p className="text-center text-white/50 text-sm mb-8 font-medium">
            Ready to find the Chor?
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1 mb-1 block">Display Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Rahul"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1 mb-1 block">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                placeholder="player@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider pl-1 mb-1 block">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold uppercase tracking-wider mt-4 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Register"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <div className="space-y-3">
            <button 
              onClick={onGoogle}
              className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button 
              onClick={onGuest}
              className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Play as Guest
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-white/50 font-medium">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
}
