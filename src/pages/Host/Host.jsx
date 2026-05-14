import { ref, update, get, push, set } from "firebase/database";
import { useEffect, useState } from "react";
import SoldModal from "../../components/SoldModal";
import { db } from "../../firebase/firebase";
import useAuction from "../../hooks/useAuction";
import useTimer from "../../hooks/useTimer";
import { players as masterPlayers } from "../../assets/players";
import PlayerCard from "../../components/PlayerCard";
import TimerRing from "../../components/TimerRing";
import AnimatedBid from "../../components/AnimatedBid";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function Host() {
  const auction = useAuction();
  const timeLeft = useTimer(auction?.timerEnd, auction?.paused);

  // Workflow Steps: 1 (Teams Setup), 2 (Player Selection), 3 (Auction Arena)
  const [step, setStep] = useState(1); 
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [auctionQueue, setAuctionQueue] = useState([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);

  // --- STEP 1: DYNAMIC TEAM SETUP ---
  const handleTeamSetup = async () => {
    const teamsData = {};
    for (let i = 1; i <= numTeams; i++) {
      const id = `team${i}`;
      teamsData[id] = {
        name: teamNames[i] || `Team ${i}`,
        purse: 20000,
        players: []
      };
    }
    await set(ref(db, "teams"), teamsData);
    setStep(2);
  };

  // --- STEP 2: PLAYER SELECTION & SKILL ORDERING ---
  const initializeArena = () => {
    if (selectedIds.length === 0) return alert("Please select players for the auction!");
    
    const selected = masterPlayers.filter(p => selectedIds.includes(p.id));
    
    // Skill Order: Batsman -> All-Rounder -> Bowler
    const order = ["Batsman", "All-Rounder", "Bowler"];
    
    const finalizedQueue = order.flatMap(role => {
      // Filter players by role and shuffle them internally
      return selected
        .filter(p => p.role === role)
        .sort(() => Math.random() - 0.5);
    });

    setAuctionQueue(finalizedQueue);
    setStep(3);
  };

  const togglePlayerSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // --- STEP 3: AUCTION CONTROLS ---
  async function startPlayer() {
    if (auctionQueue.length === 0) return alert("All selected players have been auctioned!");
    
    const nextPlayer = auctionQueue[0];
    const remainingQueue = auctionQueue.slice(1);
    setAuctionQueue(remainingQueue);

    await update(ref(db, "auction"), {
      currentPlayer: nextPlayer,
      currentBid: nextPlayer.basePrice || 1000, // Default to 1000
      highestBidder: "",
      timerEnd: Date.now() + 10000,
      status: "LIVE",
      paused: false,
      remainingTime: 10000
    });
  }

  async function togglePause() {
    if (!auction?.timerEnd) return;
    if (!auction.paused) {
      const remaining = auction.timerEnd - Date.now();
      await update(ref(db, "auction"), { paused: true, remainingTime: remaining });
    } else {
      await update(ref(db, "auction"), { 
        paused: false, 
        timerEnd: Date.now() + auction.remainingTime 
      });
    }
  }

  // --- REAL-TIME TIMER LOGIC ---
  useEffect(() => {
    if (auction?.status !== "LIVE" || !auction?.timerEnd) return;

    const interval = setInterval(async () => {
      if (auction.paused) return;
      const remaining = auction.timerEnd - Date.now();

      if (remaining <= 0) {
        clearInterval(interval);
        handleSoldTransition();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [auction]);

  async function handleSoldTransition() {
    const soldTo = auction.highestBidder;
    
    if (soldTo) {
      const teamsSnap = await get(ref(db, "teams"));
      const teams = teamsSnap.val();
      const teamKey = Object.keys(teams).find(k => teams[k].name === soldTo);

      if (teamKey) {
        const team = teams[teamKey];
        const updatedPlayers = [...(team.players || []), { 
          name: auction.currentPlayer.name, 
          price: auction.currentBid 
        }];

        await update(ref(db, `teams/${teamKey}`), {
          purse: team.purse - auction.currentBid,
          players: updatedPlayers
        });
      }
    }

    // Update History Node for Guest View
    await push(ref(db, "history"), {
      player: auction.currentPlayer.name,
      team: soldTo || "Unsold",
      price: soldTo ? auction.currentBid : 0,
      role: auction.currentPlayer.role,
      time: new Date().toLocaleTimeString()
    });

    setSoldData({
      sold: !!soldTo,
      player: auction.currentPlayer.name,
      team: soldTo,
      price: auction.currentBid
    });

    setShowSoldModal(true);
    await update(ref(db, "auction"), { status: "ENDED" });

    // Auto-reset after modal shows for 5 seconds
    setTimeout(async () => {
      setShowSoldModal(false);
      await update(ref(db, "auction"), {
        status: "IDLE",
        currentPlayer: null,
        currentBid: 0,
        highestBidder: "",
        timerEnd: null
      });
    }, 5000);
  }

  // --- CONDITIONAL RENDERING ---

  // STEP 1: DYNAMIC TEAM NAMES
  if (step === 1) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <Card className="w-full max-w-lg p-8 border-white/10 bg-white/5 backdrop-blur-lg">
        <h2 className="text-3xl font-black text-white mb-2">Team Setup</h2>
        <p className="text-slate-400 mb-6 text-sm italic">How many teams are playing this weekend?</p>
        
        <div className="space-y-4">
          <input 
            type="number" 
            placeholder="No. of Teams"
            className="w-full p-4 bg-white/10 rounded-xl border border-white/10 outline-none focus:border-blue-500"
            value={numTeams} 
            onChange={e => setNumTeams(e.target.value)} 
          />
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {[...Array(parseInt(numTeams || 0))].map((_, i) => (
              <input 
                key={i} 
                placeholder={`Team ${i+1} Name`} 
                className="w-full p-3 bg-white/5 rounded-lg border border-white/5 outline-none focus:border-purple-500"
                onChange={e => setTeamNames({...teamNames, [i+1]: e.target.value})} 
              />
            ))}
          </div>
          <Button onClick={handleTeamSetup} className="w-full h-14 mt-4 text-lg">Next: Select Players</Button>
        </div>
      </Card>
    </div>
  );

  // STEP 2: PLAYER CHECKBOXES
  if (step === 2) return (
    <div className="min-h-screen p-10 bg-slate-950 text-center">
      <h1 className="text-5xl font-black text-white mb-2">Player Selection</h1>
      <p className="text-slate-400 mb-10 italic">Tick players available for today's auction</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-w-6xl mx-auto">
        {masterPlayers.map(p => (
          <label 
            key={p.id} 
            className={`p-5 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer hover:scale-[1.02] ${
              selectedIds.includes(p.id) ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "border-white/10 bg-white/5"
            }`}
          >
            <input 
              type="checkbox" 
              className="w-6 h-6 rounded-lg accent-blue-500"
              checked={selectedIds.includes(p.id)}
              onChange={() => togglePlayerSelection(p.id)} 
            />
            <div className="text-left">
              <p className="font-bold text-white text-lg">{p.name}</p>
              <p className="text-blue-400 text-xs font-black uppercase tracking-widest">{p.role}</p>
            </div>
          </label>
        ))}
      </div>
      
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
        <Button onClick={initializeArena} className="w-full h-16 text-xl shadow-2xl">
          Enter Auction Arena ({selectedIds.length})
        </Button>
      </div>
    </div>
  );

  // STEP 3: THE LIVE CONTROL CENTER
  return (
    <div className="h-screen bg-slate-950 text-white p-6 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">HOST PANEL</h1>
          <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">
            {auctionQueue.length} Players remaining in queue
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={startPlayer} className="h-12 px-10 text-lg">Next Player</Button>
          <Button onClick={togglePause} className="h-12 px-8 bg-yellow-500 hover:bg-yellow-600 text-black font-black">
            {auction?.paused ? "RESUME" : "PAUSE"}
          </Button>
        </div>
      </div>

      {auction?.currentPlayer ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          <PlayerCard player={auction.currentPlayer} compact={true} />
          
          <div className="flex flex-col gap-6">
            <Card className="flex-1 flex flex-col items-center justify-center p-6 bg-white/5">
              <h2 className="text-slate-400 text-sm font-bold uppercase mb-6 tracking-widest">Auction Timer</h2>
              <div className="relative">
                <TimerRing timeLeft={timeLeft} />
                {auction?.paused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                    <span className="text-2xl font-black text-yellow-400">PAUSED</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="flex-1 flex flex-col items-center justify-center p-6 bg-white/5">
              <h2 className="text-slate-400 text-sm font-bold uppercase mb-4 tracking-widest">Current Bid</h2>
              <AnimatedBid bid={auction.currentBid} />
              <div className="mt-4 px-6 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <p className="text-blue-400 font-black uppercase">
                  {auction.highestBidder || "Waiting for Bids..."}
                </p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px]">
          <h2 className="text-4xl font-black text-slate-700 animate-pulse uppercase italic">Ready to start round</h2>
          <Button onClick={startPlayer} className="mt-8 h-16 px-12 text-xl">Bring Next Player</Button>
        </div>
      )}

      <SoldModal 
        open={showSoldModal} 
        {...soldData} 
        onClose={() => setShowSoldModal(false)}
      />
    </div>
  );
}