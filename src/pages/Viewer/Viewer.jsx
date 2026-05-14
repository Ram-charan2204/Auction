import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase/firebase";
import useAuction from "../../hooks/useAuction";
import ViewerHero from "../../components/ViewerHero";
import ActivityFeed from "../../components/ActivityFeed";
import AnalyticsPanel from "../../components/AnalyticsPanel";
import AuroraBackground from "../../components/AuroraBackground";

export default function Viewer() {
  const auction = useAuction();
  const [teams, setTeams] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const teamsRef = ref(db, "teams");
    const historyRef = ref(db, "history");

    // Listen for Team updates (Purse and Player lists)
    const unsubTeams = onValue(teamsRef, (snapshot) => {
      setTeams(snapshot.val() || {});
    });

    // Listen for Auction History updates
    const unsubHistory = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to array and reverse it to show newest first
        const historyArray = Object.values(data).reverse();
        setHistory(historyArray);
      }
    });

    return () => {
      unsubTeams();
      unsubHistory();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
      <AuroraBackground />
      
      <div className="relative z-10 max-w-[1800px] mx-auto p-6 md:p-10">
        {/* HEADER */}
        <div className="mb-12 text-center lg:text-left">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
            BIT WARS LIVE
          </h1>
          <p className="text-blue-400 mt-2 text-xl md:text-2xl font-medium uppercase tracking-[0.2em]">
            Broadcast Arena
          </p>
        </div>

        <div className="space-y-10">
          {/* LIVE AUCTION HERO */}
          <div className="w-full">
            {auction?.currentPlayer ? (
              <ViewerHero
                player={auction.currentPlayer}
                currentBid={auction.currentBid}
                highestBidder={auction.highestBidder}
              />
            ) : (
              <div className="h-64 flex items-center justify-center rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-md">
                <h2 className="text-3xl font-bold text-slate-500 animate-pulse">
                  WAITING FOR NEXT ROUND...
                </h2>
              </div>
            )}
          </div>

          {/* DATA SECTION */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* TEAM STATS */}
            <div className="xl:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400">Team Analytics</h3>
              </div>
              <AnalyticsPanel teams={teams} />
            </div>

            {/* LIVE ACTIVITY/HISTORY */}
            <div className="h-full">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400">Auction History</h3>
              </div>
              <ActivityFeed history={history} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}