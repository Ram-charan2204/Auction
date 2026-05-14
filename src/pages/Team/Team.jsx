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
  const { teamId } = useParams();
  const auction = useAuction();
  const timeLeft = useTimer(auction?.timerEnd, auction?.paused);

  const [team, setTeam] = useState(null);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);

  // 1. Listen to this specific team's data (Purse & Players)
  useEffect(() => {
    const teamRef = ref(db, `teams/${teamId}`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
      setTeam(snapshot.val());
    });
    return () => unsubscribe();
  }, [teamId]);

  // 2. Listen for Auction "ENDED" status to trigger Sold Modal
  useEffect(() => {
    if (auction?.status === "ENDED") {
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
  async function placeBid(amount) {
    if (!auction?.currentPlayer || auction.status !== "LIVE") return;

    // Prevent bidding against yourself
    if (auction.highestBidder === team?.name) {
      alert("You are already the highest bidder!");
      return;
    }

    if (auction?.paused) return;

    const newBidAmount = auction.currentBid + amount;

    // Purse Validation
    if (newBidAmount > (team?.purse || 0)) {
      alert("Insufficient Purse! You cannot afford this bid.");
      return;
    }

    // Update Firebase - This syncs to all users instantly
    await update(ref(db, "auction"), {
      currentBid: newBidAmount,
      highestBidder: team.name,
      // Reset timer to 10 seconds every time a new bid is placed
      timerEnd: Date.now() + 10000,
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <SpotlightBackground />

      <div className="relative z-10 max-w-[1800px] mx-auto p-4 h-screen flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
              {team?.name || "Loading..."}
            </h1>
            <p className="text-blue-400 font-bold tracking-widest text-sm">TEAM BIDDING CONSOLE</p>
          </div>

          <Card className="px-8 py-4 bg-white/5 border-white/10 backdrop-blur-md">
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Available Purse</p>
            <h2 className="text-4xl font-black text-green-400">
              ₹ {team?.purse?.toLocaleString() || 0}
            </h2>
          </Card>
        </div>

        {auction?.currentPlayer ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 overflow-hidden pb-4">
            {/* LEFT: PLAYER INFO */}
            <div className="h-full">
              <PlayerCard 
                player={auction.currentPlayer} 
                compact={true} 
              />
            </div>

            {/* RIGHT: BIDDING CONTROLS */}
            <div className="flex flex-col gap-4 h-full">
              {/* TIMER & BID DISPLAY */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                <Card className="flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-slate-400 text-sm font-bold uppercase mb-4">Time Remaining</h3>
                  <TimerRing timeLeft={timeLeft} />
                </Card>

                <Card className="flex flex-col items-center justify-center p-6 text-center border-blue-500/30">
                  <h3 className="text-slate-400 text-sm font-bold uppercase mb-2">Current Bid</h3>
                  <AnimatedBid bid={auction.currentBid} />
                  <p className="text-blue-400 font-bold mt-2 truncate max-w-full px-2">
                    {auction.highestBidder ? `BY: ${auction.highestBidder}` : "NO BIDS YET"}
                  </p>
                </Card>
              </div>

              {/* ACTION BUTTONS */}
              <Card className="p-8 bg-blue-600/5 border-blue-500/20">
                <h3 className="text-center text-slate-300 font-bold mb-6 uppercase tracking-widest">Place Your Bid</h3>
                <div className="grid grid-cols-3 gap-6">
                  {[10, 50, 100].map((val) => (
                    <Button
                      key={val}
                      disabled={auction.highestBidder === team?.name || auction?.paused}
                      onClick={() => placeBid(val)}
                      className={`h-24 text-4xl font-black transition-all transform active:scale-95 ${
                        val === 10 ? "bg-blue-600" : val === 50 ? "bg-purple-600" : "bg-green-600"
                      } ${auction.highestBidder === team?.name ? "opacity-50 grayscale" : "hover:scale-105 shadow-xl"}`}
                    >
                      +{val}
                    </Button>
                  ))}
                </div>
                {auction.highestBidder === team?.name && (
                  <p className="text-center text-green-400 font-bold mt-4 animate-pulse">
                    ★ YOU ARE THE HIGHEST BIDDER ★
                  </p>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-4xl font-bold text-slate-500 uppercase tracking-widest">
              Waiting for Auctioneer...
            </h2>
          </div>
        )}
      </div>

      <SoldModal
        open={showSoldModal}
        sold={soldData?.sold}
        player={soldData?.player}
        team={soldData?.team}
        price={soldData?.price}
      />
    </div>
  );
}