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
    if (auction?.status !== "LIVE" || !auction?.timerEnd || auction?.paused)
      return;

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
    if (!auction?.currentPlayer || auction.status !== "LIVE" || auction.paused)
      return;
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
      timerEnd: estimatedServerTime + 10000, // Reset timer to 10s for everyone
    });
  }

  // --- SUB-COMPONENTS ---

  const FinalResults = () => (
    <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-1000 pb-10">
      <h2 className="text-center text-5xl font-black italic uppercase mb-10 bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,83,22,0.3)]">
        Auction Completed
      </h2>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => {
          const team = allTeams[`team${i}`];
          const isMe = teamId === `team${i}`;
          return (
            <Card
              key={i}
              className={`p-6 flex flex-col ${isMe ? "border-orange-500 bg-orange-600/10 shadow-[0_0_30px_rgba(255,83,22,0.15)]" : "bg-black/40 border-orange-500/5"}`}
            >
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                <h3 className="text-xl font-black text-orange-500 uppercase italic tracking-wide">
                  {team?.name} {isMe && "(YOU)"}
                </h3>
                <span className="text-yellow-400 font-black text-lg">
                  ₹{(team?.purse || 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {team?.players?.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs bg-zinc-950 p-2.5 rounded-xl border border-zinc-900"
                  >
                    <span className="text-white font-bold">{p.name}</span>
                    <span className="text-yellow-500 font-black">
                      ₹{p.price?.toLocaleString()}
                    </span>
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
    <div className="grid grid-cols-3 gap-6 pt-6 border-t border-orange-500/10 w-full">
      {[1, 2, 3].map((i) => {
        const team = allTeams[`team${i}`];
        const isMe = teamId === `team${i}`;
        return (
          <Card
            key={i}
            className={`p-4 ${isMe ? "border-orange-500/40 bg-orange-600/5" : "bg-black/40 border-orange-500/5"}`}
          >
            <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2">
              <h3
                className={`font-black uppercase text-xs tracking-wide ${isMe ? "text-orange-500" : "text-zinc-400"}`}
              >
                {team?.name} {isMe && "(YOU)"}
              </h3>
              <span className="text-yellow-400 font-black text-xs">
                ₹{(team?.purse || 0).toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {team?.players?.map((p, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-[10px] bg-zinc-950/50 p-1.5 rounded border border-zinc-900"
                >
                  <span className="text-zinc-300 truncate w-24 font-medium">
                    {p.name}
                  </span>
                  <span className="text-yellow-400 font-bold">
                    ₹{p.price?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white p-4 flex flex-col justify-between select-none">
      <SpotlightBackground />

      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {teamData?.name || "Loading..."}
            </h1>
            <p className="text-orange-500 font-black text-xs uppercase tracking-widest mt-1">
              Bidding Console • {teamId}
            </p>
          </div>
          <Card className="px-8 py-4 bg-zinc-900/60 border-orange-500/20 backdrop-blur-md text-right shadow-xl">
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">
              Available Purse
            </p>
            <h2 className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.15)]">
              ₹ {(teamData?.purse || 0).toLocaleString()}
            </h2>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">
              Squad Capacity:{" "}
              <span className="text-orange-500 font-black">
                {teamData?.players?.length || 0}
              </span>{" "}
              / {maxSize}
            </p>
          </Card>
        </div>

        {/* MAIN DISPLAY AREA */}
        <div className="flex-1 flex flex-col items-center justify-center mb-8">
          {auction?.status === "LIVE" ? (
            <div className="w-full grid grid-cols-2 gap-8 items-center max-w-[1400px]">
              <PlayerCard player={auction.currentPlayer} compact={true} />
              <div className="flex flex-col gap-6 justify-center w-full">
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`p-6 flex flex-col items-center justify-center transition-colors duration-300 ${displayTime <= 3 ? "border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.15)]" : "bg-black/40 border-orange-500/5"}`}
                  >
                    <span
                      className={`text-7xl font-black italic tracking-tighter ${displayTime <= 3 ? "text-yellow-400" : "text-white"}`}
                    >
                      {displayTime}s
                    </span>
                    <p className="text-[10px] text-zinc-500 uppercase font-black mt-2 tracking-[0.2em]">
                      Remaining
                    </p>
                  </Card>
                  <Card className="bg-black/40 p-6 flex flex-col items-center justify-center border-orange-500/20 shadow-md">
                    <AnimatedBid bid={auction.currentBid} />
                    <p className="text-orange-500 font-black uppercase italic mt-2 text-center truncate w-full tracking-widest text-sm">
                      {auction.highestBidder || "Waiting for Bid"}
                    </p>
                  </Card>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 50, 100].map((v) => (
                    <Button
                      key={v}
                      onClick={() => placeBid(v)}
                      disabled={
                        auction.highestBidder === teamData?.name ||
                        auction.paused
                      }
                      className={`h-24 text-3xl font-black italic transition-all border-none ${
                        v === 10
                          ? "bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600"
                          : v === 50
                            ? "bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600"
                            : "bg-gradient-to-b from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 !text-black shadow-md shadow-yellow-500/5"
                      }`}
                    >
                      +{v}
                    </Button>
                  ))}
                </div>
                {auction.paused && (
                  <div className="text-center py-2 bg-yellow-500/10 border border-yellow-400/20 text-yellow-400 font-black rounded-xl animate-pulse uppercase text-xs tracking-widest">
                    Arena Operations Paused by Host
                  </div>
                )}
              </div>
            </div>
          ) : auction?.status === "COMPLETED" ? (
            <FinalResults />
          ) : (
            <div className="w-full max-w-2xl text-center">
              <h2 className="text-zinc-700 font-black uppercase tracking-[0.4em] mb-8 italic text-sm">
                Next Up
              </h2>
              {auction?.upcomingPlayer ? (
                <div className="opacity-30 scale-95 transition-all grayscale blur-[0.5px] pointer-events-none">
                  <PlayerCard player={auction.upcomingPlayer} compact={true} />
                </div>
              ) : (
                <h3 className="text-2xl font-black text-zinc-800 uppercase italic tracking-widest animate-pulse">
                  Next Round Loading...
                </h3>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM ROSTER GRID (Hidden on Complete) */}
        {auction?.status !== "COMPLETED" && <TeamRosters />}
      </div>

      <SoldModal
        open={showSoldModal}
        {...soldData}
        onClose={() => setShowSoldModal(false)}
      />
    </div>
  );
}
