"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Mines() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [betAmount, setBetAmount] = useState("10.00");
  const [minesCount, setMinesCount] = useState(3);
  
  const [gameStatus, setGameStatus] = useState("idle"); // idle, playing, cashed_out, bust
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(Array(25).fill("hidden"));
  const [revealed, setRevealed] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [shake, setShake] = useState(false);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
          const email = localStorage.getItem("stake_user");
          if (!email) {
            router.push("/login");
            return;
          }
          try {
            const res = await fetch("/api/user", {
              headers: { "x-email": email }
            });
            if (res.ok) {
              const data = await res.json();
              setUser({ email, balance: data.balance });
            } else {
              router.push("/login");
            }
          } catch (e) {
            console.error(e);
          }
        };
        fetchUser();
      }, [router]);
    
      const updateBalanceEvent = (newBalance) => {
        setUser(prev => ({ ...prev, balance: newBalance }));
        window.dispatchEvent(new CustomEvent("balance-update", { detail: newBalance }));
      };
    
      const [resetCountdown, setResetCountdown] = useState(null);
    
      useEffect(() => {
        if (gameStatus !== "bust" && gameStatus !== "cashed_out") return;

        const timer = setInterval(() => {
          setResetCountdown((prev) => {
            if (prev === null) return null;
            if (prev <= 1) {
              clearInterval(timer);
              setGameStatus("idle");
              setBoard(Array(25).fill("hidden"));
              setRevealed([]);
              setMultiplier(1);
              setProfit(0);
              setShake(false);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        return () => {
          clearInterval(timer);
          setResetCountdown(null);
        };
      }, [gameStatus]);
    
      const handleStart = async () => {
        if (!user || gameStatus === "playing") return;
        
        setGameStatus("idle");
        setBoard(Array(25).fill("hidden"));
        setRevealed([]);
        setMultiplier(1);
        setProfit(0);
        setShake(false);
    
        try {
          const res = await fetch("/api/game/start", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-email": user.email 
            },
            body: JSON.stringify({ betAmount, minesCount }),
          });
          const data = await res.json();
    
          if (res.ok) {
            setGameId(data.gameId);
            setGameStatus("playing");
            updateBalanceEvent(data.balance);
          } else {
            alert(data.error);
          }
        } catch (e) {
          console.error(e);
        }
      };
    
      const playSafeSound = () => {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          osc.type = 'sine'; 
          // Sharp, commanding drop in pitch (creates the punch)
          osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);
          
          // Fast attack, quick fade
          gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.5, audioCtx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
          
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          osc.start(audioCtx.currentTime);
          osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
      };
    
      const playMineSound = () => {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          osc.type = 'square'; // Square gives a rougher, explosive edge
          osc.frequency.setValueAtTime(250, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.4);
          
          gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
          
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {}
      };
    
      const handleReveal = async (index) => {
        if (gameStatus !== "playing" || revealed.includes(index) || board[index] !== "hidden") return;
    
        try {
          const res = await fetch("/api/game/reveal", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-email": user.email 
            },
            body: JSON.stringify({ gameId, tileIndex: index }),
          });
          const data = await res.json();
    
          if (res.ok) {
            if (data.status === "bust") {
              playMineSound();
              setGameStatus("bust");
              setResetCountdown(5);
              setBoard(data.board); // Contains all mines/safes
              setShake(true);
              setTimeout(() => setShake(false), 500);
            } else {
              playSafeSound();
              const newBoard = [...board];
              newBoard[index] = "safe";
              setBoard(newBoard);
              setRevealed(data.revealed);
              setMultiplier(data.multiplier);
              setProfit(parseFloat(betAmount) * data.multiplier - parseFloat(betAmount));
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
    
      const handleRandomPick = () => {
        if (gameStatus !== "playing") return;
        const hiddenIndices = [];
        board.forEach((val, i) => {
          if (val === "hidden") hiddenIndices.push(i);
        });
        if (hiddenIndices.length > 0) {
          const randomIdx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
          handleReveal(randomIdx);
        }
      };
    
      const handleCashout = async () => {
        if (gameStatus !== "playing" || revealed.length === 0) return;
    
        try {
          const res = await fetch("/api/game/cashout", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-email": user.email 
            },
            body: JSON.stringify({ gameId }),
          });
      const data = await res.json();

      if (res.ok) {
        setGameStatus("cashed_out");
        setResetCountdown(5);
        setBoard(data.board);
        updateBalanceEvent(data.balance);
        setProfit(data.payout - parseFloat(betAmount));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col-reverse md:flex-row gap-6">
      
      {/* Left Panel: Controls */}
      <div className="w-full md:w-[320px] bg-[#213743] rounded-xl p-4 flex flex-col gap-4 shadow-xl font-semibold">
        {/* Tabs */}
        <div className="order-5 md:order-none flex bg-[#0f1923] rounded-full p-1 relative mt-2 md:mt-0">
          <button className="flex-1 py-2 text-[14px] text-white bg-[#3b5463] rounded-full shadow-sm z-10 transition-colors">Manual</button>
          <button className="flex-1 py-2 text-[14px] text-white opacity-60 hover:opacity-100 transition-colors cursor-not-allowed">Auto</button>
        </div>

        {/* Bet Amount */}
        <div className="order-1 md:order-none flex flex-col gap-1">
          <div className="flex justify-between text-[#b1bad3] text-[13px]">
            <label>Bet Amount</label>
            <span>${user?.balance ? user.balance.toFixed(2) : "0.00"}</span>
          </div>
          <div className="flex rounded-md overflow-hidden bg-[#0f1923] border border-[#3b5463]/30 focus-within:border-[#557086] transition-colors">
            <div className="flex items-center flex-1 px-3 relative group">
              <span className="text-[#b1bad3] font-bold absolute left-3 pointer-events-none">$</span>
              <input 
                type="number" 
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-4 pr-8 text-white text-[14px] font-bold outline-none font-mono"
                disabled={gameStatus === "playing"}
              />
              <span className="absolute right-3 text-lg pointer-events-none grayscale opacity-80">🇺🇸</span>
            </div>
            <div className="flex bg-[#3b5463] items-center">
              <button 
                onClick={() => setBetAmount(prev => (parseFloat(prev) / 2).toFixed(2))}
                disabled={gameStatus === "playing"}
                className="px-3.5 py-2.5 text-white hover:bg-white/10 transition-colors text-[13px] border-r border-[#213743]"
              >½</button>
              <button 
                onClick={() => setBetAmount(prev => (parseFloat(prev) * 2).toFixed(2))}
                disabled={gameStatus === "playing"}
                className="px-3.5 py-2.5 text-white hover:bg-white/10 transition-colors text-[13px]"
              >2×</button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="order-2 md:order-none w-full">
        {gameStatus === "playing" ? (
          <div className="flex flex-col gap-3 mt-1 md:mt-0">
            <button 
              onClick={handleCashout}
              disabled={revealed.length === 0}
              className={`w-full py-3.5 rounded-md font-bold text-[15px] transition-all shadow-[0_4px_14px_rgba(0,231,1,0.2)] ${revealed.length > 0 ? "bg-[#00e701] hover:bg-[#00c901] text-[#0f1923]" : "bg-[#3b5463] text-white/50 cursor-not-allowed shadow-none"}`}
            >
              Cashout
            </button>
            <button 
              onClick={handleRandomPick}
              className="w-full py-3 rounded-md font-bold text-[14px] bg-[#3b5463] hover:bg-[#4a6778] text-white transition-colors"
            >
              Random Pick
            </button>
          </div>
        ) : (
          <button 
            onClick={handleStart}
            disabled={parseFloat(betAmount) < 1 || (user && parseFloat(betAmount) > user.balance)}
            className={`w-full text-white font-bold py-3.5 rounded-md text-[15px] mt-1 md:mt-0 transition-all ${
              parseFloat(betAmount) < 1 || (user && parseFloat(betAmount) > user.balance) 
                ? "bg-[#3b5463] text-white/50 cursor-not-allowed shadow-none" 
                : "bg-[#1475e1] hover:bg-[#1f82f2] shadow-[0_4px_14px_rgba(20,117,225,0.3)]"
            }`}
          >
            {user && parseFloat(betAmount) > user.balance 
              ? "Fund Account" 
              : parseFloat(betAmount) < 1 
                ? "Min Bet is $1" 
                : "Bet"}
          </button>
        )}
        </div>

        <div className="order-3 md:order-none flex flex-row md:flex-col gap-4">
          {/* Mines */}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[13px] text-[#b1bad3]">Mines</label>
            <div className="relative">
              <select 
                value={minesCount} 
                onChange={(e) => setMinesCount(parseInt(e.target.value))}
                disabled={gameStatus === "playing"}
                className="w-full bg-[#0f1923] border border-[#3b5463]/30 hover:border-[#557086] rounded-md py-3 px-3 text-white text-[14px] font-bold outline-none transition-colors appearance-none"
              >
                {Array.from({length: 24}, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Gems */}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[13px] text-[#b1bad3]">Gems</label>
            <input 
              type="text" 
              value={25 - minesCount}
              readOnly
              className="w-full bg-[#0f1923] border border-[#3b5463]/30 rounded-md py-3 px-3 text-white text-[14px] font-bold outline-none cursor-not-allowed opacity-90"
            />
          </div>
        </div>
        
        {/* Profit Display */}
        <div className="order-4 md:order-none flex flex-col gap-1 mt-1 md:mt-0">
          <div className="flex justify-between text-[#b1bad3] text-[13px]">
            <label>Total Profit ({multiplier.toFixed(2)}×)</label>
            <span>$0.00</span>
          </div>
          <div className="flex items-center bg-[#0f1923] border border-[#3b5463]/30 rounded-md py-3 px-3 relative">
            <span className="text-[#b1bad3] font-bold absolute left-3">$</span>
            <span className="pl-4 pr-8 text-white font-bold text-[14px] font-mono">
              {profit > 0 ? "+" : ""}{profit.toFixed(2)}
            </span>
            <span className="absolute right-3 text-lg grayscale opacity-80">🇺🇸</span>
          </div>
        </div>

      </div>

      {/* Right Panel: Game Grid */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-page)] rounded-lg border border-[var(--color-tile)] p-4 relative overflow-hidden min-h-[400px]">
        {/* Optional overlay messages */}
        {gameStatus === "cashed_out" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <div className="bg-[var(--color-surface)]/95 border border-[var(--color-gem)]/40 text-[var(--color-gem)] px-6 py-4 rounded-2xl text-center shadow-[0_8px_30px_rgba(0,231,1,0.15)] mb-3 flex flex-col items-center">
              <div className="text-2xl font-black italic">{multiplier.toFixed(2)}x</div>
              <div className="text-sm font-bold opacity-90">+{(profit + parseFloat(betAmount)).toFixed(2)} USDT</div>
            </div>
            {resetCountdown && <div className="text-white/80 font-medium text-xs tracking-wider bg-black/60 px-3 py-1.5 rounded-full">RESTARTING IN {resetCountdown}s</div>}
          </div>
        )}

        {gameStatus === "bust" && resetCountdown && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="bg-[var(--color-surface)]/95 text-white px-6 py-4 rounded-2xl text-center shadow-[0_8px_30px_rgba(231,76,60,0.15)] mb-3 flex flex-col items-center">
              <div className="text-lg font-black tracking-wide">YOU HIT A MINE</div>
              <div className="text-sm font-bold text-[var(--color-mine)] mt-1">-{parseFloat(betAmount).toFixed(2)} USDT</div>
            </div>
            <div className="text-white/80 font-medium text-xs tracking-wider bg-black/60 px-3 py-1.5 rounded-full">RESTARTING IN {resetCountdown}s</div>
          </div>
        )}

        <div className={`grid grid-cols-5 gap-2 md:gap-3 p-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-tile)] shadow-2xl ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
          {board.map((tileStatus, i) => (
            <button
              key={i}
              onClick={() => handleReveal(i)}
              disabled={gameStatus !== "playing" || tileStatus !== "hidden"}
              className={`w-12 h-12 md:w-16 md:h-16 rounded shadow flex items-center justify-center text-2xl md:text-3xl transition-all duration-300
                ${tileStatus === "hidden" ? "bg-[var(--color-tile)] hover:-translate-y-1 hover:bg-[#2a4555] cursor-pointer" : ""}
                ${tileStatus === "safe" ? "bg-[var(--color-surface)] border-2 border-[var(--color-gem)]/30 animate-[flip_0.6s_ease-out_forwards]" : ""}
                ${tileStatus === "mine" ? "bg-[var(--color-surface)] border-2 border-[var(--color-mine)]/30 animate-[flip_0.6s_ease-out_forwards]" : ""}
              `}
              style={{ perspective: "400px" }}
            >
              {tileStatus === "safe" && <span className="text-[var(--color-gem)] drop-shadow-[0_0_8px_rgba(0,231,1,0.5)]">✦</span>}
              {tileStatus === "mine" && <span className="drop-shadow-[0_0_8px_rgba(231,76,60,0.5)]">💣</span>}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
