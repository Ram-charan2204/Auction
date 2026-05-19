import { ref, onValue } from "firebase/database";
import { db } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import useAuction from "../../hooks/useAuction";
import PlayerCard from "../../components/PlayerCard";
import AnimatedBid from "../../components/AnimatedBid";
import Card from "../../components/ui/Card";
import SpotlightBackground from "../../components/SpotlightBackground";

export default function Viewer() {
  const auction = useAuction();
  const [allTeams, setAllTeams] = useState({});
  const [displayTime, setDisplayTime] = useState(30);
  const [serverOffset, setServerOffset] = useState(0);

  // 1. Listen for Server Sync and Team Data
  useEffect(() => {
    onValue(ref(db, ".info/serverTimeOffset"), (snap) => {
      setServerOffset(snap.val() || 0);
    });
    onValue(ref(db, "teams"), (snap) => {
      setAllTeams(snap.val() || {});
    });
  }, []);

  // 2. Synchronized Timer Loop
  useEffect(() => {
    if (auction?.status !== "LIVE" || !auction?.timerEnd || auction?.paused) return;

    const interval = setInterval(() => {
      const diff = auction.timerEnd - (Date.now() + serverOffset);
      setDisplayTime(Math.max(0, Math.ceil(diff / 1000)));
    }, 250);

    return () => clearInterval(interval);
  }, [auction?.timerEnd, auction?.status, auction?.paused, serverOffset]);

  // --- FINAL RESULTS COMPONENT ---
  const FinalLeaderboard = () => (
    <div className="w-full max-w-7xl animate-in fade-in zoom-in duration-1000 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,83,22,0.35)] mb-4">
          Auction Completed
        </h1>
        <p className="text-zinc-400 font-black tracking-[0.4em] uppercase text-sm md:text-lg">Final Squads & Standings</p>
        <div className="h-1 w-40 bg-gradient-to-r from-transparent via-orange-500 to-transparent mx-auto mt-6 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => {
          const team = allTeams[`team${i}`];
          return (
            <Card key={i} className="bg-black/40 border-orange-500/10 p-8 flex flex-col shadow-2xl transform hover:scale-[1.03] transition-all duration-500">
              <div className="flex justify-between items-end mb-6 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-orange-500 uppercase italic tracking-wide">{team?.name || `Team ${i}`}</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Tournament Finalist</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-black text-2xl">₹{team?.purse?.toLocaleString()}</p>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">Remaining Purse</p>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {team?.players?.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 group hover:border-orange-500/20 transition-all">
                    <div>
                      <p className="text-white font-bold text-base">{p.name}</p>
                      <p className="text-orange-400 text-[10px] font-black uppercase tracking-wider">{p.role}</p>
                    </div>
                    <span className="text-yellow-500 font-black text-lg">₹{p.price?.toLocaleString()}</span>
                  </div>
                ))}
                {(!team?.players || team?.players.length === 0) && (
                  <p className="text-zinc-600 italic text-center py-10 text-sm font-semibold">Empty Squad</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white p-6 md:p-8 flex flex-col overflow-hidden select-none">
      <SpotlightBackground />

      {/* HEADER BAR */}
      <div className="relative z-10 flex justify-between items-center mb-12 border-b border-orange-500/10 pb-6">
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
          Bid Wars <span className="text-orange-500 text-xl md:text-2xl ml-2 font-black not-italic border-l border-zinc-800 pl-3">Viewer Arena</span>
        </h1>
        {auction?.status === "LIVE" && (
          <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 px-5 py-1.5 rounded-full animate-pulse">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
            <span className="text-orange-500 font-black uppercase text-xs tracking-widest">Live Arena Stream</span>
          </div>
        )}
      </div>

      {/* MAIN VIEWPORT */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-[1400px] mx-auto">
        {auction?.status === "LIVE" ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:scale-105">
              <PlayerCard player={auction.currentPlayer} />
            </div>
            
            <div className="flex flex-col gap-6 w-full">
              <Card className={`p-8 bg-black/40 flex flex-col items-center justify-center backdrop-blur-xl transition-all duration-300 ${displayTime <= 3 ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'border-orange-500/10'}`}>
                <span className={`text-8xl md:text-[10rem] font-black leading-none tracking-tighter italic ${displayTime <= 3 ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'text-white'}`}>
                  {displayTime}s
                </span>
                <p className="text-zinc-500 font-black uppercase tracking-[0.35em] text-sm mt-4">Remaining Timer</p>
              </Card>

              <Card className="p-8 bg-zinc-900/30 border-orange-500/20 flex flex-col items-center justify-center backdrop-blur-xl">
                <AnimatedBid bid={auction.currentBid} />
                <div className="mt-5 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-2.5 rounded-xl font-black uppercase tracking-wider text-base shadow-lg shadow-orange-950/40 border border-orange-500/20 text-center max-w-full truncate">
                  {auction.highestBidder || "Waiting for Opening Bids"}
                </div>
              </Card>
            </div>
          </div>
        ) : auction?.status === "COMPLETED" ? (
          <FinalLeaderboard />
        ) : (
          <div className="text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-zinc-700 font-black uppercase tracking-[0.4em] mb-10 text-lg md:text-xl italic">
              Next Up In The Arena
            </h2>
            {auction?.upcomingPlayer ? (
              <div className="opacity-40 scale-95 grayscale blur-[0.5px] hover:grayscale-0 hover:opacity-100 hover:blur-0 transition-all duration-500 pointer-events-none">
                <PlayerCard player={auction.upcomingPlayer} />
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-30">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
                <h3 className="text-3xl font-black text-zinc-600 uppercase italic tracking-wider">Preparing Next Deck</h3>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER ROSTERS (Hide on Completion) */}
      {auction?.status !== "COMPLETED" && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-orange-500/10">
          {[1, 2, 3].map((i) => {
            const team = allTeams[`team${i}`];
            return (
              <div key={i} className="flex justify-between items-center bg-black/40 border border-orange-500/10 p-5 rounded-2xl backdrop-blur-sm">
                <div>
                  <h4 className="text-orange-500 font-black uppercase text-sm tracking-wide italic">{team?.name || `Team ${i}`}</h4>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Squad: {team?.players?.length || 0} / 11 Players</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-black text-xl">₹{(team?.purse || 0).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}