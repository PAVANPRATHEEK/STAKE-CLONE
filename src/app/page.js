"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("stake_user"));
    };
    checkAuth();
    
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  const games = [
    { name: "Mines", image: "💣", link: "/mines", active: true },
    { name: "Crash", image: "📈", link: "#", active: false },
    { name: "Dice", image: "🎲", link: "#", active: false },
    { name: "Plinko", image: "🔴", link: "#", active: false }
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      {!isLoggedIn && (
        <section className="bg-[var(--color-surface)] py-20 px-6 text-center border-b border-[var(--color-tile)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cta)]/10 to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tight mb-6">
            WELCOME TO <span className="text-[var(--color-cta)]">STAKE</span>
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto">
            Experience the ultimate crypto casino with provably fair games, instant payouts, and the best community.
          </p>
          <Link 
            href="/login" 
            className="inline-block bg-[var(--color-cta)] hover:bg-[var(--color-cta-hover)] text-white font-bold text-lg px-8 py-4 rounded transition-transform hover:scale-105 shadow-[0_4px_20px_rgba(20,117,225,0.4)]"
          >
            Play Now
          </Link>
        </div>
      </section>
      )}

      {/* Games Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-8">Original Games</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {games.map((game) => (
            game.active ? (
              <Link href={game.link} key={game.name} className="group relative block overflow-hidden rounded-xl bg-[var(--color-surface)] border border-[var(--color-tile)] aspect-[3/4] transition-transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-page)]">
                  <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">{game.image}</span>
                  <span className="text-xl font-black italic text-white tracking-widest">{game.name}</span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                  <span className="bg-[var(--color-cta)] text-white text-sm font-bold py-2 px-6 rounded-full shadow-[0_4px_15px_rgba(20,117,225,0.4)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Play Now
                  </span>
                </div>
              </Link>
            ) : (
              <div key={game.name} className="relative block overflow-hidden rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-tile)]/50 aspect-[3/4] opacity-70 grayscale">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl mb-4">{game.image}</span>
                  <span className="text-xl font-black italic text-white tracking-widest">{game.name}</span>
                </div>
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <span className="font-bold text-[var(--color-text-secondary)] px-4 py-2 border border-[var(--color-text-secondary)] rounded-full text-sm">
                    Coming Soon
                  </span>
                </div>
              </div>
            )
          ))}
        </div>
      </section>
    </div>
  );
}
