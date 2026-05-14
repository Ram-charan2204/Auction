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
        <h1 className="text-8xl font-black text-white italic uppercase tracking-tighter animate-pulse mb-4">
          Auction Completed
        </h1>
        <p className="text-blue-400 font-bold tracking-[0.5em] uppercase text-xl">Final Squads & Standings</p>
        <div className="h-1.5 w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-6 rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-10">
        {[1, 2, 3].map((i) => {
          const team = allTeams[`team${i}`];
          return (
            <Card key={i} className="bg-white/5 border-white/10 p-8 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-all duration-500">
              <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase italic">{team?.name || `Team ${i}`}</h3>
                  <p className="text-blue-500 text-xs font-bold uppercase tracking-widest mt-1">Tournament Finalist</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-black text-2xl">₹{team?.purse?.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Remaining Purse</p>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {team?.players?.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-white font-bold text-base">{p.name}</p>
                      <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{p.role}</p>
                    </div>
                    <span className="text-yellow-500 font-black text-lg">₹{p.price}</span>
                  </div>
                ))}
                {(!team?.players || team?.players.length === 0) && (
                  <p className="text-slate-600 italic text-center py-10">Empty Squad</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-white p-8 flex flex-col overflow-hidden">
      <SpotlightBackground />

      {/* HEADER BAR */}
      <div className="relative z-10 flex justify-between items-center mb-12 border-b border-white/5 pb-6">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
          Bid Wars <span className="text-blue-600 text-2xl ml-2">Viewer Mode</span>
        </h1>
        {auction?.status === "LIVE" && (
          <div className="flex items-center gap-4 bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full animate-pulse">
            <div className="w-3 h-3 bg-red-600 rounded-full" />
            <span className="text-red-500 font-black uppercase text-sm tracking-widest">Live Auction</span>
          </div>
        )}
      </div>

      {/* MAIN VIEWPORT */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {auction?.status === "LIVE" ? (
          <div className="w-full max-w-6xl grid grid-cols-2 gap-12 items-center">
            <div className="transform scale-110">
              <PlayerCard player={auction.currentPlayer} />
            </div>
            
            <div className="flex flex-col gap-8">
              <Card className="p-12 bg-white/5 border-white/10 flex flex-col items-center justify-center backdrop-blur-xl">
                <span className="text-[12rem] font-black leading-none tracking-tighter text-white drop-shadow-2xl">
                  {displayTime}s
                </span>
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-xl">Clock Running</p>
              </Card>

              <Card className="p-12 bg-blue-600/5 border-blue-500/30 flex flex-col items-center justify-center backdrop-blur-xl">
                <AnimatedBid bid={auction.currentBid} />
                <div className="mt-6 bg-blue-600 text-white px-8 py-2 rounded-full font-black uppercase tracking-widest text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                  {auction.highestBidder || "Waiting for Bids"}
                </div>
              </Card>
            </div>
          </div>
        ) : auction?.status === "COMPLETED" ? (
          <FinalLeaderboard />
        ) : (
          <div className="text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h2 className="text-slate-600 font-black uppercase tracking-[0.5em] mb-12 text-2xl italic">
              Next Up In The Arena
            </h2>
            {auction?.upcomingPlayer ? (
              <div className="opacity-60 scale-95 grayscale blur-[1px] hover:grayscale-0 hover:opacity-100 hover:blur-0 transition-all duration-700">
                <PlayerCard player={auction.upcomingPlayer} />
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-20">
                <div className="w-24 h-24 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mb-6" />
                <h3 className="text-5xl font-black text-slate-700 uppercase italic">Preparing Next Round</h3>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER ROSTERS (Hide on Completion) */}
      {auction?.status !== "COMPLETED" && (
        <div className="relative z-10 grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10">
          {[1, 2, 3].map((i) => {
            const team = allTeams[`team${i}`];
            return (
              <div key={i} className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                <div>
                  <h4 className="text-blue-400 font-black uppercase text-sm tracking-widest">{team?.name || `Team ${i}`}</h4>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">Squad: {team?.players?.length || 0} Players</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-black text-xl">₹{(team?.purse || 0).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}