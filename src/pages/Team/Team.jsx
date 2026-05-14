import { ref, update, onValue } from "firebase/database";
import { db } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuction from "../../hooks/useAuction";
import useTimer from "../../hooks/useTimer";
import PlayerCard from "../../components/PlayerCard";
import TimerRing from "../../components/TimerRing";
import AnimatedBid from "../../components/AnimatedBid";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import SoldModal from "../../components/SoldModal";
import SpotlightBackground from "../../components/SpotlightBackground";

export default function Team() {
  const { teamId } = useParams(); // e.g., 'team1'
  const auction = useAuction();
  const timeLeft = useTimer(auction?.timerEnd, auction?.paused);

  const [teamData, setTeamData] = useState(null);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);

  // 1. Listen to this specific team's data in real-time
  useEffect(() => {
    if (!teamId) return;
    const teamRef = ref(db, `teams/${teamId}`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTeamData(data);
      }
    });
    return () => unsubscribe();
  }, [teamId]);

  // 2. Handle Sold Modal trigger
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

  // 3. Bidding Logic
  async function placeBid(increment) {
    if (!auction?.currentPlayer || auction.status !== "LIVE" || auction.paused) return;

    // Prevent bidding against yourself
    if (auction.highestBidder === teamData?.name) {
      alert("You are already the highest bidder!");
      return;
    }

    const nextBid = (auction.currentBid || 0) + increment;

    // VALIDATION: Check if team has enough money
    if (nextBid > (teamData?.purse || 0)) {
      alert("Insufficient Purse! You cannot afford this bid.");
      return;
    }

    // UPDATE FIREBASE
    await update(ref(db, "auction"), {
      currentBid: nextBid,
      highestBidder: teamData.name,
      timerEnd: Date.now() + 10000, // Reset to 10 seconds
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <SpotlightBackground />

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 h-screen flex flex-col">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden pb-4">
            {/* PLAYER INFO */}
            <div className="h-full overflow-hidden">
              <PlayerCard player={auction.currentPlayer} compact={true} />
            </div>

            {/* BIDDING AREA */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 h-1/2">
                <Card className="flex flex-col items-center justify-center p-6 bg-white/5">
                  <span className="text-slate-500 text-xs font-bold uppercase mb-4">Timer</span>
                  <TimerRing timeLeft={timeLeft} />
                </Card>

                <Card className="flex flex-col items-center justify-center p-6 bg-white/5 border-blue-500/20">
                  <span className="text-slate-500 text-xs font-bold uppercase mb-2">Current Bid</span>
                  <AnimatedBid bid={auction.currentBid} />
                  <div className="mt-4 px-4 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <p className="text-blue-400 text-xs font-bold truncate uppercase">
                      {auction.highestBidder || "No Bids"}
                    </p>
                  </div>
                </Card>
              </div>

              {/* BID BUTTONS */}
              <Card className="flex-1 p-8 bg-gradient-to-b from-white/5 to-transparent border-white/10">
                <h3 className="text-center text-slate-400 text-xs font-black mb-6 uppercase tracking-[0.2em]">
                  Place Increment
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[10, 50, 100].map((val) => (
                    <Button
                      key={val}
                      disabled={auction.highestBidder === teamData?.name || auction.paused}
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
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <h2 className="text-2xl font-bold text-slate-600 uppercase tracking-widest">Waiting for Host...</h2>
          </div>
        )}
      </div>

      <SoldModal
        open={showSoldModal}
        {...soldData}
        onClose={() => setShowSoldModal(false)}
      />
    </div>
  );
}