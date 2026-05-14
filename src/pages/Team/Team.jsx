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
  const [maxSize, setMaxSize] = useState(11);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);
  const [displayTime, setDisplayTime] = useState(30);
  const [serverOffset, setServerOffset] = useState(0);

  // 1. Listen for Server Offset, Team Data, and Global Settings
  useEffect(() => {
    onValue(ref(db, ".info/serverTimeOffset"), (snap) => {
      setServerOffset(snap.val() || 0);
    });
    onValue(ref(db, `teams/${teamId}`), (snap) => {
      setTeamData(snap.val());
    });
    onValue(ref(db, "teams"), (snap) => {
      setAllTeams(snap.val() || {});
    });
    onValue(ref(db, "settings/maxTeamSize"), (snap) => {
      setMaxSize(snap.val() || 11);
    });
  }, [teamId]);

  // 2. Synchronized Local Countdown Timer
  useEffect(() => {
    if (auction?.status !== "LIVE" || !auction?.timerEnd || auction?.paused) return;

    const runCalculatedTimer = setInterval(() => {
      const trueCurrentTime = Date.now() + serverOffset;
      const diff = auction.timerEnd - trueCurrentTime;
      const secondsLeft = Math.max(0, Math.ceil(diff / 1000));
      
      setDisplayTime(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(runCalculatedTimer);
      }
    }, 250);

    return () => clearInterval(runCalculatedTimer);
  }, [auction?.timerEnd, auction?.status, auction?.paused, serverOffset]);

  // 3. Handle Sold Modal trigger
  useEffect(() => {
    if (auction?.status === "ENDED" && auction?.currentPlayer) {
      setSoldData({
        sold: !!auction.highestBidder,
        player: auction.currentPlayer.name,
        team: auction.highestBidder,
        price: auction.currentBid,
      });
      setShowSoldModal(true);
      setTimeout(() => setShowSoldModal(false), 5000);
    }
  }, [auction?.status]);

  // 4. Secure Bidding Logic
  async function placeBid(increment) {
    if (!auction?.currentPlayer || auction.status !== "LIVE" || auction.paused) return;
    if (auction.highestBidder === teamData?.name) return;

    // Check Max Size Limit set by Host
    if ((teamData?.players?.length || 0) >= maxSize) {
      return alert(`Maximum squad size of ${maxSize} reached!`);
    }

    const nextBid = (auction.currentBid || 0) + increment;
    if (nextBid > (teamData?.purse || 0)) {
      return alert("Insufficient Purse!");
    }

    const estimatedServerTime = Date.now() + serverOffset;

    await update(ref(db, "auction"), {
      currentBid: nextBid,
      highestBidder: teamData.name,
      timerEnd: estimatedServerTime + 10000 // Reset timer to 10s for everyone
    });
  }

  // --- SUB-COMPONENTS ---

  const FinalResults = () => (
    <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-1000 pb-10">
      <h2 className="text-center text-5xl font-black text-white italic uppercase mb-10 animate-pulse">
        Auction Completed
      </h2>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => {
          const team = allTeams[`team${i}`];
          const isMe = teamId === `team${i}`;
          return (
            <Card key={i} className={`p-6 flex flex-col ${isMe ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/10'}`}>
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                <h3 className="text-xl font-bold text-blue-400 uppercase italic">{team?.name} {isMe && "(YOU)"}</h3>
                <span className="text-green-400 font-black text-lg">₹{(team?.purse || 0).toLocaleString()}</span>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
                {team?.players?.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-white font-bold">{p.name}</span>
                    <span className="text-yellow-500 font-black">₹{p.price}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const TeamRosters = () => (
    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
      {[1, 2, 3].map((i) => {
        const team = allTeams[`team${i}`];
        const isMe = teamId === `team${i}`;
        return (
          <Card key={i} className={`p-4 ${isMe ? 'border-blue-500 bg-blue-500/5' : 'bg-white/5 border-white/10'}`}>
            <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
              <h3 className="text-white font-black uppercase text-xs">
                {team?.name} {isMe && "(YOU)"}
              </h3>
              <span className="text-green-400 font-black text-xs">
                ₹{(team?.purse || 0).toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {team?.players?.map((p, idx) => (
                <div key={idx} className="flex justify-between text-[10px] bg-white/5 p-1.5 rounded">
                  <span className="text-slate-300 truncate w-24">{p.name}</span>
                  <span className="text-green-400 font-bold">₹{p.price}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white p-4 flex flex-col justify-between">
      <SpotlightBackground />
      
      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              {teamData?.name || "Loading..."}
            </h1>
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">
              Bidding Console • {teamId}
            </p>
          </div>
          <Card className="px-8 py-4 bg-white/5 border-blue-500/20 backdrop-blur-md text-right">
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Available Purse</p>
            <h2 className="text-4xl font-black text-green-400">
              ₹ {(teamData?.purse || 0).toLocaleString()}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">
              Squad Size: {teamData?.players?.length || 0} / {maxSize}
            </p>
          </Card>
        </div>

        {/* MAIN DISPLAY AREA */}
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
            {auction?.status === "LIVE" ? (
                <div className="w-full grid grid-cols-2 gap-8">
                    <PlayerCard player={auction.currentPlayer} compact={true} />
                    <div className="flex flex-col gap-6 justify-center">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-white/5 p-6 flex flex-col items-center justify-center">
                                <span className="text-7xl font-black">{displayTime}s</span>
                                <p className="text-[10px] text-slate-500 uppercase font-black mt-2 tracking-[0.2em]">Remaining</p>
                            </Card>
                            <Card className="bg-white/5 p-6 flex flex-col items-center justify-center border-blue-500/20">
                                <AnimatedBid bid={auction.currentBid} />
                                <p className="text-blue-400 font-black uppercase mt-2 text-center truncate w-full tracking-widest">
                                  {auction.highestBidder || "Waiting for Bid"}
                                </p>
                            </Card>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[10, 50, 100].map(v => (
                                <Button 
                                  key={v} 
                                  onClick={() => placeBid(v)} 
                                  disabled={auction.highestBidder === teamData?.name || auction.paused} 
                                  className={`h-24 text-3xl font-black transition-all ${
                                    v === 10 ? "bg-blue-600" : v === 50 ? "bg-purple-600" : "bg-emerald-600"
                                  }`}
                                >
                                  +{v}
                                </Button>
                            ))}
                        </div>
                        {auction.paused && (
                          <div className="text-center py-2 bg-yellow-600/20 text-yellow-500 font-black rounded-lg animate-pulse uppercase text-xs tracking-widest">
                            Auction Paused by Host
                          </div>
                        )}
                    </div>
                </div>
            ) : auction?.status === "COMPLETED" ? (
                <FinalResults />
            ) : (
                <div className="w-full max-w-2xl text-center">
                    <h2 className="text-slate-600 font-black uppercase tracking-[0.4em] mb-8 italic">Next Up</h2>
                    {auction?.upcomingPlayer ? (
                        <div className="scale-90 opacity-40 grayscale blur-[1px]">
                             <PlayerCard player={auction.upcomingPlayer} />
                        </div>
                    ) : (
                        <h3 className="text-4xl font-black text-slate-800 uppercase italic">Next Round Loading...</h3>
                    )}
                </div>
            )}
        </div>

        {/* BOTTOM ROSTER GRID (Hidden on Complete) */}
        {auction?.status !== "COMPLETED" && <TeamRosters />}
      </div>

      <SoldModal open={showSoldModal} {...soldData} onClose={() => setShowSoldModal(false)} />
    </div>
  );
}