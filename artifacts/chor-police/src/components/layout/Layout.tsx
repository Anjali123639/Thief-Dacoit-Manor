import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { useLocation } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isGameOrLobby = location.startsWith("/game") || location.startsWith("/lobby");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-x-hidden w-full">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[150px]" />
      </div>

      {!isGameOrLobby && <Navbar />}

      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto z-10 pb-20 md:pb-0 px-4 md:px-6 pt-6 md:pt-10">
        {children}
      </main>
    </div>
  );
}
