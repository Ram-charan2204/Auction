import { ref, update, get, push, set, remove } from "firebase/database";
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

  // Workflow Steps: 0 (Dashboard), 1 (Teams), 2 (Captains), 3 (Selection), 4 (Arena)
  const [step, setStep] = useState(0); 
  const [numTeams, setNumTeams] = useState(2);
  const [teamNames, setTeamNames] = useState({});
  const [captains, setCaptains] = useState({}); // { team1: playerId }
  const [selectedIds, setSelectedIds] = useState([]);
  const [auctionQueue, setAuctionQueue] = useState([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);

  // --- GLOBAL RESET: NEW AUCTION ---
  const handleNewAuction = async () => {
    const confirmReset = window.confirm("Create New Auction? This deletes all current team data and history.");
    if (!confirmReset) return;

    // 1. Reset Firebase
    await remove(ref(db, "teams"));
    await remove(ref(db, "history"));
    await set(ref(db, "auction"), {
      status: "IDLE",
      currentBid: 0,
      currentPlayer: null,
      highestBidder: "",
      timerEnd: null,
      paused: false
    });

    // 2. Reset Local State
    setTeamNames({});
    setCaptains({});
    setSelectedIds([]);
    setAuctionQueue([]);
    setStep(1);
  };

  // --- STEP 1: TEAM NAMES ---
  const handleTeamSetup = async () => {
    const teamsData = {};
    for (let i = 1; i <= numTeams; i++) {
      const id = `team${i}`;
      teamsData[id] = {
        name: teamNames[i] || `Team ${i}`,
        purse: 20000, // Explicit Number
        players: []
      };
    }
    await set(ref(db, "teams"), teamsData);
    setStep(2);
  };

  // --- STEP 2: ASSIGN CAPTAINS ---
  const handleCaptainSelection = async () => {
    const teamsSnap = await get(ref(db, "teams"));
    const currentTeams = teamsSnap.val();
    
    for (const [teamId, playerId] of Object.entries(captains)) {
      if (!playerId) continue;
      const player = masterPlayers.find(p => p.id === parseInt(playerId));
      const team = currentTeams[teamId];
      
      // Deduct 1000 for captain and add to team roster
      await update(ref(db, `teams/${teamId}`), {
        purse: team.purse - 1000,
        players: [{ 
          name: player.name, 
          price: 1000, 
          isCaptain: true, 
          role: player.role 
        }]
      });
    }
    setStep(3);
  };

  // --- STEP 3: POOL SELECTION & SKILL SHUFFLE ---
  const initializeArena = () => {
    if (selectedIds.length === 0) return alert("Select players for the auction pool!");
    
    const selected = masterPlayers.filter(p => selectedIds.includes(p.id));
    const order = ["Batsman", "All-Rounder", "Bowler"];
    
    // Sort by role and shuffle within each role group
    const finalizedQueue = order.flatMap(role => {
      return selected
        .filter(p => p.role === role)
        .sort(() => Math.random() - 0.5);
    });

    setAuctionQueue(finalizedQueue);
    setStep(4);
  };

  const togglePlayerSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // --- STEP 4: LIVE AUCTION CONTROLS ---
  async function startPlayer() {
    if (auctionQueue.length === 0) return alert("Auction Pool Empty!");
    
    const nextPlayer = auctionQueue[0];
    const remainingQueue = auctionQueue.slice(1);
    setAuctionQueue(remainingQueue);

    await update(ref(db, "auction"), {
      currentPlayer: nextPlayer,
      currentBid: 1000,
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

  // --- HAMMER LOGIC ---
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
          price: auction.currentBid,
          role: auction.currentPlayer.role
        }];
        await update(ref(db, `teams/${teamKey}`), {
          purse: team.purse - auction.currentBid,
          players: updatedPlayers
        });
      }
    }

    // Log to History
    await push(ref(db, "history"), {
      player: auction.currentPlayer.name,
      team: soldTo || "Unsold",
      price: soldTo ? auction.currentBid : 0,
      role: auction.currentPlayer.role,
      time: new Date().toLocaleTimeString()
    });

    setSoldData({ sold: !!soldTo, player: auction.currentPlayer.name, team: soldTo, price: auction.currentBid });
    setShowSoldModal(true);
    await update(ref(db, "auction"), { status: "ENDED" });

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

  // --- SCREEN RENDERS ---

  if (step === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="max-w-md w-full p-10 text-center border-blue-500/20 bg-white/5 backdrop-blur-xl">
        <h1 className="text-5xl font-black text-white mb-6 italic tracking-tighter uppercase">Host</h1>
        <Button onClick={handleNewAuction} className="w-full h-20 text-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          New Auction
        </Button>
      </Card>
    </div>
  );

  if (step === 1) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-lg p-8 border-white/10 bg-white/5">
        <h2 className="text-3xl font-black text-white mb-6 uppercase italic">1. Team Setup</h2>
        <input type="number" placeholder="No. of Teams" className="w-full p-4 bg-white/10 rounded-xl mb-4 text-white outline-none" value={numTeams} onChange={e => setNumTeams(e.target.value)} />
        <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2">
          {[...Array(parseInt(numTeams || 0))].map((_, i) => (
            <input key={i} placeholder={`Team ${i+1} Name`} className="w-full p-3 bg-white/5 rounded-lg text-white border border-white/5" onChange={e => setTeamNames({...teamNames, [i+1]: e.target.value})} />
          ))}
        </div>
        <Button onClick={handleTeamSetup} className="w-full h-14">Confirm Teams</Button>
      </Card>
    </div>
  );

  if (step === 2) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-2xl p-8 bg-white/5 border-white/10">
        <h2 className="text-3xl font-black mb-2 text-white italic text-center uppercase">2. Assign Captains</h2>
        <p className="text-slate-400 mb-8 italic text-center">Cost: ₹1000 per Captain (Deducted from Purse)</p>
        <div className="space-y-4">
          {Object.keys(teamNames).map((num) => (
            <div key={num} className="flex flex-col gap-1">
              <label className="text-blue-400 font-bold text-xs uppercase">Captain for {teamNames[num]}</label>
              <select className="w-full p-4 bg-white/10 rounded-xl text-white border border-white/10" onChange={(e) => setCaptains({...captains, [`team${num}`]: e.target.value})}>
                <option value="">Select a Player</option>
                {masterPlayers.map(p => (
                   <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <Button onClick={handleCaptainSelection} className="w-full h-14 mt-8">Confirm Captains</Button>
      </Card>
    </div>
  );

  if (step === 3) {
    const assignedIds = Object.values(captains).map(id => parseInt(id));
    const available = masterPlayers.filter(p => !assignedIds.includes(p.id));

    return (
      <div className="min-h-screen p-10 bg-slate-950 text-center">
        <h1 className="text-5xl font-black text-white mb-2 italic uppercase">3. Selection Pool</h1>
        <p className="text-slate-400 mb-10 italic">Tick available players for the auction pool</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto mb-24">
          {available.map(p => (
            <label key={p.id} className={`p-5 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${selectedIds.includes(p.id) ? "border-blue-500 bg-blue-500/10 shadow-lg" : "border-white/10 bg-white/5"}`}>
              <input type="checkbox" className="w-5 h-5 accent-blue-500" checked={selectedIds.includes(p.id)} onChange={() => togglePlayerSelection(p.id)} />
              <div className="text-left">
                <p className="font-bold text-white text-lg">{p.name}</p>
                <p className="text-blue-400 text-xs font-black uppercase tracking-widest">{p.role}</p>
              </div>
            </label>
          ))}
        </div>
        <Button onClick={initializeArena} className="fixed bottom-10 left-1/2 -translate-x-1/2 h-16 px-12 text-xl shadow-2xl z-50">
          Initialize Arena ({selectedIds.length} Players)
        </Button>
      </div>
    );
  }

  // STEP 4: ARENA CONTROL
  return (
    <div className="h-screen bg-slate-950 text-white p-6 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Arena Control</h1>
          <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">
            {auctionQueue.length} Remaining in Queue
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={handleNewAuction} className="h-12 px-6 bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
            New Auction
          </Button>
          <div className="w-[2px] bg-white/10 h-12 mx-1" />
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
               <TimerRing timeLeft={timeLeft} />
            </Card>
            <Card className="flex-1 flex flex-col items-center justify-center p-6 bg-white/5">
              <AnimatedBid bid={auction.currentBid} />
              <div className="mt-4 px-6 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <p className="text-blue-400 font-black uppercase tracking-widest">
                  {auction.highestBidder || "Waiting for Bids..."}
                </p>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px]">
          <h2 className="text-4xl font-black text-slate-700 animate-pulse uppercase italic tracking-widest">Arena Ready</h2>
          <Button onClick={startPlayer} className="mt-8 h-16 px-12 text-xl italic uppercase">Start Next Round</Button>
        </div>
      )}

      <SoldModal open={showSoldModal} {...soldData} onClose={() => setShowSoldModal(false)} />
    </div>
  );
}