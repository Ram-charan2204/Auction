import { ref, update, get, push, set, remove, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import SoldModal from "../../components/SoldModal";
import { db } from "../../firebase/firebase";
import useAuction from "../../hooks/useAuction";
import { players as masterPlayers } from "../../assets/players";
import PlayerCard from "../../components/PlayerCard";
import AnimatedBid from "../../components/AnimatedBid";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function Host() {
  const auction = useAuction();

  // Workflow Steps: 0 (Dashboard), 1 (Captains), 2 (Selection), 3 (Arena)
  const [step, setStep] = useState(0); 
  const [captains, setCaptains] = useState({ team1: "", team2: "", team3: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [auctionQueue, setAuctionQueue] = useState([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);
  const [allTeams, setAllTeams] = useState({});
  
  const [localTimeLeft, setLocalTimeLeft] = useState(30);
  const [serverOffset, setServerOffset] = useState(0);

  // Calculate clock drift offset from cloud engine
  useEffect(() => {
    const offsetRef = ref(db, ".info/serverTimeOffset");
    return onValue(offsetRef, (snap) => setServerOffset(snap.val() || 0));
  }, []);

  useEffect(() => {
    const teamsRef = ref(db, "teams");
    return onValue(teamsRef, (snap) => setAllTeams(snap.val() || {}));
  }, []);

  // Loop Countdown checking absolute cloud metrics
  useEffect(() => {
    if (auction?.status !== "LIVE" || !auction?.timerEnd || auction?.paused) return;

    const interval = setInterval(() => {
      const trueCurrentTime = Date.now() + serverOffset;
      const diff = auction.timerEnd - trueCurrentTime;
      const secondsLeft = Math.max(0, Math.ceil(diff / 1000));
      setLocalTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        handleSoldTransition();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [auction?.timerEnd, auction?.status, auction?.paused, serverOffset]);

  // --- GLOBAL RESET: NEW AUCTION ---
  const handleNewAuction = async () => {
    const confirmReset = window.confirm("Create New Auction? This will reset all 3 teams and history.");
    if (!confirmReset) return;

    // 1. Reset Firebase Nodes
    await remove(ref(db, "history"));
    await set(ref(db, "auction"), {
      status: "IDLE",
      currentBid: 0,
      currentPlayer: null,
      highestBidder: "",
      timerEnd: null,
      paused: false
    });

    const initialTeams = {
      team1: { name: "Team 1", purse: 20000, players: [] },
      team2: { name: "Team 2", purse: 20000, players: [] },
      team3: { name: "Team 3", purse: 20000, players: [] }
    };
    await set(ref(db, "teams"), initialTeams);

    // 2. HARD RESET LOCAL VALUES (Ensures captains are completely cleared)
    setCaptains({ team1: "", team2: "", team3: "" });
    setSelectedIds([]);
    setAuctionQueue([]);
    setStep(1); 
  };

  // --- STEP 1: ASSIGN CAPTAINS ---
  const handleCaptainSelection = async () => {
    // Validation check: ensure all 3 captains are assigned before moving forward
    if (!captains.team1 || !captains.team2 || !captains.team3) {
      alert("Please assign a unique captain to all 3 teams first!");
      return;
    }

    const teamsSnap = await get(ref(db, "teams"));
    const currentTeams = teamsSnap.val();
    
    for (const [teamId, playerId] of Object.entries(captains)) {
      if (!playerId) continue;
      const player = masterPlayers.find(p => p.id === parseInt(playerId));
      const team = currentTeams[teamId];
      
      await update(ref(db, `teams/${teamId}`), {
        purse: Number(team.purse) - 1000,
        players: [{ name: player.name, price: 1000, isCaptain: true, role: player.role }]
      });
    }
    setStep(2); 
  };

  // --- STEP 2: POOL SELECTION & RANDOMIZED SHUFFLE ---
  const initializeArena = () => {
    if (selectedIds.length === 0) return alert("Select players!");
    const selected = masterPlayers.filter(p => selectedIds.includes(p.id));
    const order = ["Batsman", "All-Rounder", "Bowler"];
    
    const finalizedQueue = order.flatMap(role => {
      return selected.filter(p => p.role === role).sort(() => Math.random() - 0.5);
    });

    setAuctionQueue(finalizedQueue);
    setStep(3); 
  };

  const startPlayer = async () => {
    if (auctionQueue.length === 0) return alert("Auction Pool Empty!");
    const nextPlayer = auctionQueue[0];
    setAuctionQueue(auctionQueue.slice(1));
    setLocalTimeLeft(30);

    const trueCurrentTime = Date.now() + serverOffset;

    await update(ref(db, "auction"), {
      currentPlayer: nextPlayer,
      currentBid: 1000,
      highestBidder: "",
      timerEnd: trueCurrentTime + 30000, 
      status: "LIVE",
      paused: false
    });
  };

  async function handleSoldTransition() {
    await update(ref(db, "auction"), { status: "PROCESSING" });
    const currentAuctionSnap = await get(ref(db, "auction"));
    const activeAuction = currentAuctionSnap.val();
    const soldTo = activeAuction.highestBidder;

    if (soldTo) {
      const teamsSnap = await get(ref(db, "teams"));
      const teams = teamsSnap.val();
      const teamKey = Object.keys(teams).find(k => teams[k].name === soldTo);

      if (teamKey) {
        const team = teams[teamKey];
        const updatedPlayers = [...(team.players || []), { 
          name: activeAuction.currentPlayer.name, 
          price: activeAuction.currentBid,
          role: activeAuction.currentPlayer.role
        }];
        await update(ref(db, `teams/${teamKey}`), {
          purse: Number(team.purse) - activeAuction.currentBid,
          players: updatedPlayers
        });
      }
    }

    await push(ref(db, "history"), {
      player: activeAuction.currentPlayer.name,
      team: soldTo || "Unsold",
      price: soldTo ? activeAuction.currentBid : 0,
      role: activeAuction.currentPlayer.role,
      time: new Date().toLocaleTimeString()
    });

    setSoldData({ sold: !!soldTo, player: activeAuction.currentPlayer.name, team: soldTo, price: activeAuction.currentBid });
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

  const TeamRosters = () => (
    <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/10">
      {[1, 2, 3].map((i) => {
        const team = allTeams[`team${i}`];
        return (
          <Card key={i} className="bg-white/5 p-5 border-white/10 flex flex-col min-h-[200px]">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
              <h3 className="text-blue-400 font-black uppercase text-sm tracking-wider">{team?.name || `Team ${i}`}</h3>
              <span className="text-green-400 font-bold text-sm">₹ {(team?.purse || 0).toLocaleString()}</span>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 max-h-48 pr-1">
              {team?.players?.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded border border-white/5">
                  <span className="text-white font-medium">{p.name}</span>
                  <span className="text-slate-400 uppercase text-[10px] bg-white/5 px-2 py-0.5 rounded font-bold">{p.role}</span>
                  <span className="text-green-400 font-bold">₹{p.price}</span>
                </div>
              ))}
              {(!team?.players || team?.players.length === 0) && <p className="text-slate-600 text-xs italic text-center mt-4">No players bought yet</p>}
            </div>
          </Card>
        );
      })}
    </div>
  );

  // --- SCREEN LAYOUT ROUTING ---

  if (step === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="max-w-md w-full p-10 text-center border-blue-500/20 bg-white/5 backdrop-blur-xl">
        <h1 className="text-5xl font-black text-white mb-6 italic tracking-tighter uppercase">Host</h1>
        <Button onClick={handleNewAuction} className="w-full h-20 text-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)]">New Auction</Button>
      </Card>
    </div>
  );

  if (step === 1) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-2xl p-8 bg-white/5 border-white/10">
        <h2 className="text-3xl font-black mb-2 text-white italic text-center uppercase">Assign Captains</h2>
        <p className="text-slate-400 mb-8 italic text-center text-sm uppercase">One captain per team. Duplicate selections are blocked.</p>
        <div className="space-y-6">
          {[1, 2, 3].map((num) => {
            const currentTeamKey = `team${num}`;
            return (
              <div key={num} className="flex flex-col gap-2">
                <label className="text-blue-400 font-bold text-xs uppercase tracking-widest">Captain for Team {num}</label>
                <select 
                  className="w-full p-4 rounded-xl text-white border border-white/20 outline-none"
                  style={{ backgroundColor: "#0f172a", color: "white" }} 
                  value={captains[currentTeamKey]} // Force explicit value control configuration
                  onChange={(e) => setCaptains({...captains, [currentTeamKey]: e.target.value})}
                >
                  <option value="" style={{ background: "#0f172a" }}>Select a Player</option>
                  {masterPlayers.map(p => {
                    // Check if this player is selected by ANY other team drop down
                    const isPickedByOtherTeam = Object.entries(captains).some(
                      ([teamKey, selectedPlayerId]) => teamKey !== currentTeamKey && selectedPlayerId === String(p.id)
                    );

                    return (
                      <option 
                        key={p.id} 
                        value={p.id} 
                        disabled={isPickedByOtherTeam} // Disables selection options dynamically
                        style={{ 
                          background: "#1e293b", 
                          color: isPickedByOtherTeam ? "#475569" : "white",
                          textDecoration: isPickedByOtherTeam ? "line-through" : "none"
                        }}
                      >
                        {p.name} ({p.role}) {isPickedByOtherTeam ? "— [PICKED]" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>
        <Button onClick={handleCaptainSelection} className="w-full h-14 mt-10">Confirm Captains</Button>
      </Card>
    </div>
  );

  if (step === 2) {
    // Extract assigned captains to make sure they NEVER show up inside the selection checkboxes
    const assignedCaptainIds = Object.values(captains).map(id => parseInt(id || 0));
    const availablePlayersOnly = masterPlayers.filter(p => !assignedCaptainIds.includes(p.id));

    return (
      <div className="min-h-screen p-10 bg-slate-950 text-center">
        <h1 className="text-5xl font-black text-white mb-10 uppercase">Selection Pool</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto mb-24">
          {availablePlayersOnly.map(p => (
            <label key={p.id} className={`p-5 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${selectedIds.includes(p.id) ? "border-blue-500 bg-blue-500/10 shadow-lg" : "border-white/10 bg-white/5"}`}>
              <input type="checkbox" className="w-5 h-5 accent-blue-500" checked={selectedIds.includes(p.id)} onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(sid => sid !== p.id) : [...prev, p.id])} />
              <div className="text-left"><p className="font-bold text-white text-lg">{p.name}</p><p className="text-blue-400 text-xs font-black uppercase tracking-widest">{p.role}</p></div>
            </label>
          ))}
        </div>
        <Button onClick={initializeArena} className="fixed bottom-10 left-1/2 -translate-x-1/2 h-16 px-12 text-xl shadow-2xl z-50">Initialize Arena</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">Arena Control</h1>
            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">{auctionQueue.length} Players Remaining</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleNewAuction} className="h-12 px-6 bg-blue-600/20 border border-blue-500/50 text-blue-400">New Auction</Button>
            <div className="w-[2px] bg-white/10 h-12 mx-1" />
            <Button onClick={startPlayer} className="h-12 px-10 text-lg">Next Player</Button>
          </div>
        </div>

        {auction?.currentPlayer ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <PlayerCard player={auction.currentPlayer} compact={true} />
            <div className="flex flex-col gap-6 justify-between">
              <Card className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 min-h-[180px]">
                <span className="text-7xl font-black text-white tracking-tight">{localTimeLeft}s</span>
                <h2 className="text-slate-500 text-xs font-bold uppercase mt-2 tracking-widest">Global Server Offset Loop</h2>
              </Card>
              <Card className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 min-h-[180px]">
                <AnimatedBid bid={auction.currentBid} />
                <div className="mt-4 px-6 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full">
                  <p className="text-blue-400 font-black uppercase tracking-widest text-sm">{auction.highestBidder || "Waiting for First Bid..."}</p>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[40px]">
            <h2 className="text-4xl font-black text-slate-700 animate-pulse uppercase italic tracking-widest">Arena Ready</h2>
            <Button onClick={startPlayer} className="mt-6 h-16 px-12 text-xl italic uppercase">Start Next Round</Button>
          </div>
        )}
      </div>

      <TeamRosters />
      <SoldModal open={showSoldModal} {...soldData} onClose={() => setShowSoldModal(false)} />
    </div>
  );
}