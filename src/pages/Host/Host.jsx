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

  // Workflow Steps: 0 (Settings), 1 (Captains), 2 (Pool Selection), 3 (Live Arena)
  const [step, setStep] = useState(0); 
  const [captains, setCaptains] = useState({ team1: "", team2: "", team3: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [maxTeamSize, setMaxTeamSize] = useState(7);
  const [auctionQueue, setAuctionQueue] = useState([]);
  const [unsoldQueue, setUnsoldQueue] = useState([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);
  const [allTeams, setAllTeams] = useState({});
  const [localTimeLeft, setLocalTimeLeft] = useState(30);
  const [serverOffset, setServerOffset] = useState(0);

  // 1. Sync Server Offset and Teams Data
  useEffect(() => {
    onValue(ref(db, ".info/serverTimeOffset"), (snap) => {
      setServerOffset(snap.val() || 0);
    });
    onValue(ref(db, "teams"), (snap) => {
      setAllTeams(snap.val() || {});
    });
  }, []);

  // 2. Synchronized Global Timer Loop
  useEffect(() => {
    if (auction?.status !== "LIVE" || !auction?.timerEnd || auction?.paused) return;

    const interval = setInterval(() => {
      const trueNow = Date.now() + serverOffset;
      const diff = auction.timerEnd - trueNow;
      const secondsLeft = Math.max(0, Math.ceil(diff / 1000));
      setLocalTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        handleSoldTransition();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [auction?.timerEnd, auction?.status, auction?.paused, serverOffset]);

  // --- AUCTION ACTIONS ---

  const handleNewAuction = async () => {
    if (!window.confirm("Start New Auction? This will reset all current progress.")) return;

    await remove(ref(db, "history"));
    await set(ref(db, "settings"), { maxTeamSize: Number(maxTeamSize) });
    await set(ref(db, "auction"), { 
      status: "IDLE", 
      currentBid: 0, 
      paused: false,
      currentPlayer: null,
      upcomingPlayer: null,
      highestBidder: "" 
    });
    await set(ref(db, "teams"), {
      team1: { name: "Team 1", purse: 20000, players: [] },
      team2: { name: "Team 2", purse: 20000, players: [] },
      team3: { name: "Team 3", purse: 20000, players: [] }
    });

    setCaptains({ team1: "", team2: "", team3: "" });
    setSelectedIds([]);
    setAuctionQueue([]);
    setUnsoldQueue([]);
    setStep(1); 
  };

  const handleCaptainSelection = async () => {
    if (!captains.team1 || !captains.team2 || !captains.team3) {
      return alert("Please assign all 3 captains first!");
    }
    const currentTeams = (await get(ref(db, "teams"))).val();
    
    for (const [teamId, pId] of Object.entries(captains)) {
      const player = masterPlayers.find(p => p.id === parseInt(pId));
      await update(ref(db, `teams/${teamId}`), {
        purse: Number(currentTeams[teamId].purse) - 1000,
        players: [{ ...player, price: 1000, isCaptain: true }]
      });
    }
    setStep(2);
  };

  const initializeArena = async () => {
    if (selectedIds.length === 0) return alert("Select players for the pool!");
    const selected = masterPlayers.filter(p => selectedIds.includes(p.id));
    const order = ["Batsman", "All-Rounder", "Bowler"];
    const finalized = order.flatMap(role => 
      selected.filter(p => p.role === role).sort(() => Math.random() - 0.5)
    );
    
    setAuctionQueue(finalized);
    await update(ref(db, "auction"), { upcomingPlayer: finalized[0] || null });
    setStep(3);
  };

  const startPlayer = async () => {
    let nextPlayer = null;
    let newQueue = [...auctionQueue];
    let newUnsold = [...unsoldQueue];

    if (newQueue.length > 0) {
      nextPlayer = newQueue.shift();
      setAuctionQueue(newQueue);
    } else if (newUnsold.length > 0) {
      nextPlayer = newUnsold.shift();
      setUnsoldQueue(newUnsold);
    } else {
      // End of Auction
      await update(ref(db, "auction"), { 
        status: "COMPLETED", 
        currentPlayer: null, 
        upcomingPlayer: null 
      });
      return;
    }

    const upcoming = newQueue[0] || newUnsold[0] || null;
    const trueNow = Date.now() + serverOffset;

    await update(ref(db, "auction"), {
      currentPlayer: nextPlayer,
      upcomingPlayer: upcoming,
      currentBid: nextPlayer.basePrice || 1000,
      highestBidder: "",
      timerEnd: trueNow + 30000,
      status: "LIVE",
      paused: false
    });
  };

  const togglePause = async () => {
    if (auction?.status !== "LIVE") return;
    const trueNow = Date.now() + serverOffset;
    if (!auction.paused) {
      const remaining = auction.timerEnd - trueNow;
      await update(ref(db, "auction"), { paused: true, remainingTime: remaining });
    } else {
      await update(ref(db, "auction"), { 
        paused: false, 
        timerEnd: trueNow + auction.remainingTime 
      });
    }
  };

  async function handleSoldTransition() {
    await update(ref(db, "auction"), { status: "PROCESSING" });
    const snap = await get(ref(db, "auction"));
    const cur = snap.val();
    const soldTo = cur.highestBidder;

    if (soldTo) {
      const teams = (await get(ref(db, "teams"))).val();
      const teamKey = Object.keys(teams).find(k => teams[k].name === soldTo);
      const updated = [...(teams[teamKey].players || []), { ...cur.currentPlayer, price: cur.currentBid }];
      await update(ref(db, `teams/${teamKey}`), {
        purse: Number(teams[teamKey].purse) - cur.currentBid,
        players: updated
      });
    } else {
      setUnsoldQueue(prev => [...prev, cur.currentPlayer]);
    }

    await push(ref(db, "history"), { 
      player: cur.currentPlayer.name, 
      team: soldTo || "Unsold", 
      price: soldTo ? cur.currentBid : 0 
    });

    setSoldData({ sold: !!soldTo, player: cur.currentPlayer.name, team: soldTo, price: cur.currentBid });
    setShowSoldModal(true);
    await update(ref(db, "auction"), { status: "ENDED" });

    setTimeout(async () => {
      setShowSoldModal(false);
      const nextUp = auctionQueue[0] || unsoldQueue[0] || null;
      await update(ref(db, "auction"), { 
        status: "IDLE", 
        currentPlayer: null, 
        upcomingPlayer: nextUp 
      });
    }, 5000);
  }

  // --- SUB-COMPONENTS ---

  const FinalResults = () => (
    <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-1000">
      <div className="text-center mb-10">
        <h2 className="text-6xl font-black text-white italic uppercase animate-pulse mb-2">Auction Completed</h2>
        <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map(i => {
          const team = allTeams[`team${i}`];
          return (
            <Card key={i} className="bg-white/5 border-white/10 p-5 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <h3 className="text-xl font-bold text-blue-400 uppercase italic">{team?.name}</h3>
                <span className="text-green-400 font-black">₹{team?.purse?.toLocaleString()}</span>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                {team?.players?.map((p, idx) => (
                  <div key={idx} className="flex justify-between bg-white/5 p-2 rounded-lg border border-white/5 text-xs">
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
    <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/10 w-full">
      {[1, 2, 3].map((i) => {
        const team = allTeams[`team${i}`];
        return (
          <Card key={i} className="bg-white/5 p-4 border-white/10 flex flex-col min-h-[160px]">
            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
              <h4 className="text-blue-400 font-black uppercase text-[10px]">{team?.name || `Team ${i}`}</h4>
              <span className="text-green-400 font-bold text-xs">₹{(team?.purse || 0).toLocaleString()}</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {team?.players?.map((p, idx) => (
                <div key={idx} className="flex justify-between text-[10px] bg-white/5 p-1 rounded">
                  <span className="text-white truncate w-32">{p.name}</span>
                  <span className="text-green-400">₹{p.price}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );

  // --- RENDER LOGIC ---

  if (step === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="max-w-md w-full p-10 bg-white/5 border-white/10 text-center">
        <h1 className="text-white text-3xl font-bold mb-8 italic uppercase tracking-widest">Bid Wars</h1>
        <div className="text-left mb-8">
          <label className="text-blue-400 text-xs font-bold uppercase mb-2 block tracking-widest">Max Squad Size</label>
          <input 
            type="number" 
            className="w-full p-4 bg-slate-900 border border-white/10 rounded-xl text-white outline-none" 
            value={maxTeamSize} 
            onChange={(e) => setMaxTeamSize(e.target.value)}
          />
        </div>
        <Button onClick={handleNewAuction} className="w-full h-16 text-xl font-black">Initialize Tournament</Button>
      </Card>
    </div>
  );

  if (step === 1) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-2xl p-8 bg-white/5 border-white/10">
        <h2 className="text-3xl font-black mb-6 text-white text-center uppercase italic">Assign Captains</h2>
        <div className="space-y-6">
          {[1, 2, 3].map(n => (
            <select 
              key={n} 
              value={captains[`team${n}`]} 
              className="w-full p-4 rounded-xl text-white bg-slate-900 border border-white/20" 
              onChange={e => setCaptains({...captains, [`team${n}`]: e.target.value})}
            >
              <option value="">Captain for Team {n}</option>
              {masterPlayers.map(p => (
                <option key={p.id} value={p.id} disabled={Object.values(captains).includes(String(p.id))}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          ))}
        </div>
        <Button onClick={handleCaptainSelection} className="w-full h-14 mt-10 font-black uppercase">Confirm Captains</Button>
      </Card>
    </div>
  );

  if (step === 2) return (
    <div className="min-h-screen p-10 bg-slate-950 text-center">
      <h1 className="text-5xl font-black text-white mb-10 uppercase italic">Selection Pool</h1>
      <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto mb-24">
        {masterPlayers.filter(p => !Object.values(captains).includes(String(p.id))).map(p => (
          <label key={p.id} className={`p-5 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${selectedIds.includes(p.id) ? "border-blue-500 bg-blue-500/10 shadow-lg" : "border-white/10 bg-white/5"}`}>
            <input 
              type="checkbox" 
              checked={selectedIds.includes(p.id)} 
              onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])} 
            />
            <div className="text-left">
              <p className="font-bold text-white text-lg">{p.name}</p>
              <p className="text-blue-400 text-xs font-bold uppercase">{p.role}</p>
            </div>
          </label>
        ))}
      </div>
      <Button onClick={initializeArena} className="fixed bottom-10 left-1/2 -translate-x-1/2 h-16 px-12 text-xl font-black shadow-2xl">Start Arena</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Arena Control</h1>
          <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">{auctionQueue.length + unsoldQueue.length} Players Remaining</p>
        </div>
        <div className="flex gap-3">
          {auction?.status === "LIVE" && (
            <Button onClick={togglePause} className={`${auction?.paused ? 'bg-green-600' : 'bg-yellow-600'} h-12 px-6 font-black uppercase`}>
              {auction?.paused ? "Resume" : "Pause"}
            </Button>
          )}
          <Button onClick={startPlayer} className="h-12 px-10 text-lg bg-blue-600 font-black uppercase">Next Player</Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {auction?.status === "LIVE" ? (
          <div className="w-full grid grid-cols-2 gap-8">
            <PlayerCard player={auction.currentPlayer} compact={true} />
            <div className="flex flex-col gap-6 justify-center">
              <Card className="p-10 bg-white/5 flex flex-col items-center justify-center">
                <span className="text-8xl font-black text-white">{localTimeLeft}s</span>
                <p className="text-slate-500 uppercase font-bold tracking-widest mt-2">Remaining</p>
              </Card>
              <Card className="p-10 bg-white/5 flex flex-col items-center justify-center border-blue-500/20">
                <AnimatedBid bid={auction.currentBid} />
                <p className="text-blue-400 font-black mt-4 uppercase tracking-widest">{auction.highestBidder || "No Bids"}</p>
              </Card>
            </div>
          </div>
        ) : auction?.status === "COMPLETED" ? (
          <FinalResults />
        ) : (
          <div className="w-full max-w-4xl text-center">
            <h2 className="text-slate-600 font-black uppercase tracking-[0.4em] mb-8 italic">Next Up</h2>
            {auction?.upcomingPlayer ? (
              <div className="opacity-60 scale-95 transition-all grayscale hover:grayscale-0 hover:opacity-100">
                <PlayerCard player={auction.upcomingPlayer} />
              </div>
            ) : (
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Next Round Loading...</h3>
            )}
          </div>
        )}
      </div>

      {auction?.status !== "COMPLETED" && <TeamRosters />}
      
      <SoldModal open={showSoldModal} {...soldData} onClose={() => setShowSoldModal(false)} />
    </div>
  );
}