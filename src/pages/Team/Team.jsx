import { ref, update, onValue } from "firebase/database";
import { db } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuction from "../../hooks/useAuction";
import PlayerCard from "../../components/PlayerCard";
import AnimatedBid from "../../components/AnimatedBid";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import SoldModal from "../../components/SoldModal";
import SpotlightBackground from "../../components/SpotlightBackground";

export default function Team() {
  const { teamId } = useParams();
  const auction = useAuction();

  const [teamData, setTeamData] = useState(null);
  const [allTeams, setAllTeams] = useState({});
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);
  
  const [displayTime, setDisplayTime] = useState(30);
  const [serverOffset, setServerOffset] = useState(0);

  // 1. CRITICAL: Calculate the exact clock drift between this laptop and Firebase Servers
  useEffect(() => {
    const offsetRef = ref(db, ".info/serverTimeOffset");
    return onValue(offsetRef, (snap) => {
      setServerOffset(snap.val() || 0);
    });
  }, []);

  // 2. Real-time Listeners
  useEffect(() => {
    if (!teamId) return;
    return onValue(ref(db, `teams/${teamId}`), (snapshot) => {
      if (snapshot.exists()) setTeamData(snapshot.val());
    });
  }, [teamId]);

  useEffect(() => {
    return onValue(ref(db, "teams"), (snapshot) => {
      if (snapshot.exists()) setAllTeams(snapshot.val());
    });
  }, []);

  // 3. Precise Synced Countdown Loop
  useEffect(() => {
    if (auction?.status !== "LIVE" || !auction?.timerEnd || auction?.paused) return;

    const runCalculatedTimer = setInterval(() => {
      // Estimated true time = Local Time + Server Offset
      const trueCurrentTime = Date.now() + serverOffset; 
      const diff = auction.timerEnd - trueCurrentTime;
      const secondsLeft = Math.max(0, Math.ceil(diff / 1000));
      
      setDisplayTime(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(runCalculatedTimer);
      }
    }, 200);

    return () => clearInterval(runCalculatedTimer);
  }, [auction?.timerEnd, auction?.status, auction?.paused, serverOffset]);

  // 4. Handle Sold Modal
  useEffect(() => {
    if (auction?.status === "ENDED" && auction?.currentPlayer) {
      setSoldData({
        sold: !!auction.highestBidder,
        player: auction.currentPlayer?.name,
        team: auction.highestBidder,
        price: auction.currentBid,
      });
      setShowSoldModal(true);
      setTimeout(() => setShowSoldModal(false), 5000);
    }
  }, [auction?.status]);

  // 5. Secure Bid Placement
  async function placeBid(increment) {
    if (!auction?.currentPlayer || auction.status !== "LIVE" || auction.paused) return;
    if (auction.highestBidder === teamData?.name) return;

    const nextBid = (auction.currentBid || 0) + increment;
    if (nextBid > (teamData?.purse || 0)) {
      alert("Insufficient Purse!");
      return;
    }

    // Capture precise cloud time and project 10 seconds ahead
    const estimatedServerTime = Date.now() + serverOffset;

    await update(ref(db, "auction"), {
      currentBid: nextBid,
      highestBidder: teamData.name,
      timerEnd: estimatedServerTime + 10000 
    });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white p-4 flex flex-col justify-between">
      <SpotlightBackground />

      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              {teamData?.name || "Loading Team..."}
            </h1>
            <p className="text-blue-400 font-bold text-xs tracking-widest uppercase">
              Bidding Console • {teamId}
            </p>
          </div>

          <Card className="px-8 py-4 bg-white/5 border-blue-500/20 backdrop-blur-md">
            <p className="text-slate-400 text-[10px] uppercase font-black mb-1 tracking-widest">Available Purse</p>
            <h2 className="text-4xl font-black text-green-400">
              ₹ {(teamData?.purse || 0).toLocaleString()}
            </h2>
          </Card>
        </div>

        {auction?.currentPlayer ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-stretch mb-6">
            <div className="h-full">
              <PlayerCard player={auction.currentPlayer} compact={true} />
            </div>

            <div className="flex flex-col gap-4 justify-between">
              <div className="grid grid-cols-2 gap-4 h-1/2">
                <Card className="flex flex-col items-center justify-center p-6 bg-white/5">
                  <span className="text-7xl font-black text-white tracking-tight">{displayTime}s</span>
                  <span className="text-blue-500 text-xs font-bold uppercase mt-2 tracking-widest">Cloud Locked</span>
                </Card>

                <Card className="flex flex-col items-center justify-center p-6 bg-white/5 border-blue-500/20">
                  <span className="text-slate-500 text-xs font-bold uppercase mb-2">Current Bid</span>
                  <AnimatedBid bid={auction.currentBid} />
                  <div className="mt-4 px-4 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 max-w-full">
                    <p className="text-blue-400 text-xs font-bold truncate uppercase text-center">
                      {auction.highestBidder || "No Bids"}
                    </p>
                  </div>
                </Card>
              </div>

              <Card className="flex-1 p-8 bg-gradient-to-b from-white/5 to-transparent border-white/10 flex flex-col justify-center">
                <h3 className="text-center text-slate-400 text-xs font-black mb-6 uppercase tracking-[0.2em]">
                  Place Increment
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[10, 50, 100].map((val) => (
                    <Button
                      key={val}
                      disabled={auction.highestBidder === teamData?.name || auction.paused || auction.status !== "LIVE"}
                      onClick={() => placeBid(val)}
                      className={`h-24 text-3xl font-black transition-all ${
                        val === 10 ? "bg-blue-600 hover:bg-blue-500" : 
                        val === 50 ? "bg-purple-600 hover:bg-purple-500" : 
                        "bg-emerald-600 hover:bg-emerald-500"
                      } ${auction.highestBidder === teamData?.name ? "opacity-30 cursor-not-allowed" : "shadow-lg hover:scale-105 active:scale-95"}`}
                    >
                      +{val}
                    </Button>
                  ))}
                </div>
                {auction.highestBidder === teamData?.name && (
                  <p className="text-center text-green-400 font-bold mt-6 animate-pulse uppercase text-sm tracking-widest">
                    You are the highest bidder!
                  </p>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 h-64 flex flex-col items-center justify-center mb-6">
             <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <h2 className="text-2xl font-bold text-slate-600 uppercase tracking-widest">Waiting for Host...</h2>
          </div>
        )}

        {/* TEAM CONTAINER ROSTER GRID */}
        <div className="grid grid-cols-3 gap-6 mt-4 pt-6 border-t border-white/10 w-full relative z-20">
          {[1, 2, 3].map((i) => {
            const currentLoopId = `team${i}`;
            const targetTeam = allTeams[currentLoopId];
            const isSelf = teamId === currentLoopId;

            return (
              <Card 
                key={i} 
                className={`p-5 backdrop-blur-md flex flex-col min-h-[220px] transition-all ${
                  isSelf ? "bg-blue-500/5 border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.15)]" : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-black uppercase text-sm tracking-wider">{targetTeam?.name || `Team ${i}`}</h3>
                    {isSelf && <span className="text-[9px] font-extrabold bg-blue-500 text-white px-1.5 py-0.5 rounded tracking-tighter uppercase">YOU</span>}
                  </div>
                  <span className="text-green-400 font-black text-sm">₹ {(targetTeam?.purse || 0).toLocaleString()}</span>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 max-h-44 pr-1">
                  {targetTeam?.players?.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded border border-white/5">
                      <span className="text-white font-semibold truncate max-w-[120px]">{p.name}</span>
                      <span className="text-slate-400 uppercase text-[9px] bg-slate-900/60 px-2 py-0.5 rounded font-black tracking-wider">{p.role || "Squad"}</span>
                      <span className="text-green-400 font-black">₹{p.price}</span>
                    </div>
                  ))}
                  {(!targetTeam?.players || targetTeam?.players.length === 0) && (
                    <p className="text-slate-600 text-xs italic text-center mt-6">No players drafted yet</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <SoldModal open={showSoldModal} {...soldData} onClose={() => setShowSoldModal(false)} />
    </div>
  );
}