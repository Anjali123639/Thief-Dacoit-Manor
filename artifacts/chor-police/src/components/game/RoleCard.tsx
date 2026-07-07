import { useState, useEffect } from "react";
import { playSound } from "@/lib/sounds";
import { Crown, ShieldAlert, Ghost, Skull } from "lucide-react";

type Role = "babu" | "police" | "chor" | "dakat";

interface RoleCardProps {
  role: Role;
  reveal?: boolean;
  className?: string;
}

const ROLE_CONFIG = {
  babu: {
    title: "Babu",
    color: "bg-amber-500",
    shadow: "shadow-[0_0_30px_rgba(245,158,11,0.5)]",
    icon: Crown,
    desc: "The safe VIP"
  },
  police: {
    title: "Police",
    color: "bg-blue-600",
    shadow: "shadow-[0_0_30px_rgba(37,99,235,0.5)]",
    icon: ShieldAlert,
    desc: "Find the Chor!"
  },
  chor: {
    title: "Chor",
    color: "bg-red-600",
    shadow: "shadow-[0_0_30px_rgba(220,38,38,0.5)]",
    icon: Ghost,
    desc: "Hide from Police"
  },
  dakat: {
    title: "Dakat",
    color: "bg-purple-900",
    shadow: "shadow-[0_0_30px_rgba(88,28,135,0.5)]",
    icon: Skull,
    desc: "Guaranteed points"
  }
};

export function RoleCard({ role, reveal = true, className = "" }: RoleCardProps) {
  const [flipped, setFlipped] = useState(false);
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  useEffect(() => {
    if (reveal) {
      const timer = setTimeout(() => {
        setFlipped(true);
        playSound("cardFlip");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [reveal]);

  return (
    <div className={`relative w-48 h-64 perspective-1000 ${className}`}>
      <div 
        className={`w-full h-full transition-all duration-700 preserve-3d relative ${
          flipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Back (Hidden initially) */}
        <div className="absolute inset-0 backface-hidden w-full h-full rounded-2xl bg-card border-2 border-white/10 shadow-xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-3xl font-black text-white/20">?</span>
          </div>
        </div>

        {/* Card Front (Revealed) */}
        <div 
          className={`absolute inset-0 backface-hidden w-full h-full rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center p-4 rotate-y-180 ${config.color} ${config.shadow}`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full rounded-xl border border-white/20 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <Icon className="w-16 h-16 text-white mb-4 drop-shadow-md" />
            <h2 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-md mb-1">{config.title}</h2>
            <p className="text-xs font-bold text-white/80 uppercase tracking-widest">{config.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
