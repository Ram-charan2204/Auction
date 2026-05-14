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

  const [step, setStep] = useState(0); 
  const [captains, setCaptains] = useState({ team1: "", team2: "", team3: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [maxTeamSize, setMaxTeamSize] = useState(5);
  const [auctionQueue, setAuctionQueue] = useState([]);
  const [unsoldQueue, setUnsoldQueue] = useState([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldData, setSoldData] = useState(null);
  const [allTeams, setAllTeams] = useState({});
  const [serverOffset, setServerOffset] = useState(0);
  const [localTimeLeft, setLocalTimeLeft] = useState(30);

  useEffect(() => {
    onValue(ref(db, ".info/serverTimeOffset"), (snap) => setServerOffset(snap.val() || 0));
    onValue(ref(db, "teams"), (snap) => setAllTeams(snap.val() || {}));
  }, []);

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

  const handleNewAuction = async () => {
    if (!window.confirm("Start New Auction?")) return;
    await remove(ref(db, "history"));
    await set(ref(db, "settings"), { maxTeamSize: Number(maxTeamSize) });
    await set(ref(db, "auction"), { 
        status: "IDLE", 
        currentBid: 0, 
        paused: false,
        currentPlayer: null,
        upcomingPlayer: null 
    });
    await set(ref(db, "teams"), {
      team1: { name: "Team 1", purse: 20000, players: [] },
      team2: { name: "Team 2", purse: 20000, players: [] },
      team3: { name: "Team 3", purse: 20000, players: [] }
    });
    setStep(1); 
  };

  const handleCaptainSelection = async () => {
    const currentTeams = (await get(ref(db, "teams"))).val();
    for (const [teamId, playerId] of Object.entries(captains)) {
      if (!playerId) continue;
      const player = masterPlayers.find(p => p.id === parseInt(playerId));
      await update(ref(db, `teams/${teamId}`), {
        purse: Number(currentTeams[teamId].purse) - 1000,
        players: [{ name: player.name, price: 1000, isCaptain: true, role: player.role, image: player.image }]
      });
    }
    setStep(2); 
  };

  const initializeArena = async () => {
    const selected = masterPlayers.filter(p => selectedIds.includes(p.id));
    const order = ["Batsman", "All-Rounder", "Bowler"];
    const finalized = order.flatMap(role => 
      selected.filter(p => p.role === role).sort(() => Math.random() - 0.5)
    );
    
    setAuctionQueue(finalized);
    // Set the very first player as "Upcoming" so it shows on the start screen
    await update(ref(db, "auction"), { upcomingPlayer: finalized[0] || null });
    setStep(3); 
  };

  const startPlayer = async () => {
    let nextPlayer = null;
    let updatedMainQueue = [...auctionQueue];
    let updatedUnsoldQueue = [...unsoldQueue];

    if (updatedMainQueue.length > 0) {
      nextPlayer = updatedMainQueue.shift();
      setAuctionQueue(updatedMainQueue);
    } else if (updatedUnsoldQueue.length > 0) {
      nextPlayer = updatedUnsoldQueue.shift();
      setUnsoldQueue(updatedUnsoldQueue);
    } else {
      return alert("No players left!");
    }

    const upcoming = updatedMainQueue[0] || updatedUnsoldQueue[0] || null;

    await update(ref(db, "auction"), {
      currentPlayer: nextPlayer,
      upcomingPlayer: upcoming,
      currentBid: 1000,
      highestBidder: "",
      timerEnd: Date.now() + serverOffset + 30000,
      status: "LIVE",
      paused: false
    });
  };

  const togglePause = async () => {
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
    const soldTo = auction.highestBidder;
    if (!soldTo) {
      setUnsoldQueue(prev => [...prev, auction.currentPlayer]);
    } else {
      const teams = (await get(ref(db, "teams"))).val();
      const teamKey = Object.keys(teams).find(k => teams[k].name === soldTo);
      const team = teams[teamKey];
      const updatedPlayers = [...(team.players || []), { ...auction.currentPlayer, price: auction.currentBid }];
      await update(ref(db, `teams/${teamKey}`), {
        purse: Number(team.purse) - auction.currentBid,
        players: updatedPlayers
      });
    }

    setSoldData({ sold: !!soldTo, player: auction.currentPlayer.name, team: soldTo, price: auction.currentBid });
    setShowSoldModal(true);
    await update(ref(db, "auction"), { status: "ENDED" });

    setTimeout(async () => {
      setShowSoldModal(false);
      // Determine next upcoming player for the gap
      const nextUp = auctionQueue[0] || unsoldQueue[0] || null;
      await update(ref(db, "auction"), { 
        status: "IDLE", 
        currentPlayer: null, 
        upcomingPlayer: nextUp 
      });
    }, 5000);
  }

  const TeamRosters = () => (
    <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/10">
      {[1, 2, 3].map((i) => {
        const team = allTeams[`team${i}`];
        return (
          <Card key={i} className="bg-white/5 p-4 border-white/10 flex flex-col min-h-[180px]">
            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
              <h3 className="text-blue-400 font-black uppercase text-xs">{team?.name || `Team ${i}`}</h3>
              <span className="text-green-400 font-bold text-xs">₹ {(team?.purse || 0).toLocaleString()}</span>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-32">
              {team?.players?.map((p, idx) => (
                <div key={idx} className="flex justify-between text-[10px] bg-white/5 p-1 rounded">
                  <span className="text-white truncate w-24">{p.name}</span>
                  <span className="text-green-400">₹{p.price}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );

  if (step === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="max-w-md w-full p-10 bg-white/5 border-white/10 text-center">
        <h1 className="text-white text-3xl font-bold mb-8 italic">AUCTION SETTINGS</h1>
        <div className="text-left mb-8">
          <label className="text-blue-400 text-xs font-bold uppercase mb-2 block">Max Players Per Team</label>
          <input type="number" value={maxTeamSize} onChange={e => setMaxTeamSize(e.target.value)} className="w-full p-4 bg-slate-900 border border-white/10 rounded-xl text-white outline-none" />
        </div>
        <Button onClick={handleNewAuction} className="w-full h-16 text-xl">Create Auction</Button>
      </Card>
    </div>
  );

  if (step === 1) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-2xl p-8 bg-white/5 border-white/10">
        <h2 className="text-3xl font-black mb-6 text-white text-center uppercase italic">Assign Captains</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((num) => (
            <select key={num} className="w-full p-4 rounded-xl text-white bg-slate-900 border border-white/20" onChange={(e) => setCaptains({...captains, [`team${num}`]: e.target.value})}>
              <option value="">Captain for Team {num}</option>
              {masterPlayers.map(p => (
                <option key={p.id} value={p.id} disabled={Object.values(captains).includes(String(p.id))}>{p.name}</option>
              ))}
            </select>
          ))}
        </div>
        <Button onClick={handleCaptainSelection} className="w-full h-14 mt-10">Confirm Captains</Button>
      </Card>
    </div>
  );

  if (step === 2) return (
    <div className="min-h-screen p-10 bg-slate-950 text-center">
      <h1 className="text-5xl font-black text-white mb-10 uppercase italic">Selection Pool</h1>
      <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto mb-24">
        {masterPlayers.filter(p => !Object.values(captains).includes(String(p.id))).map(p => (
          <label key={p.id} className={`p-5 rounded-2xl border flex items-center gap-4 cursor-pointer ${selectedIds.includes(p.id) ? "border-blue-500 bg-blue-500/10 shadow-lg" : "border-white/10 bg-white/5"}`}>
            <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])} />
            <div className="text-left"><p className="font-bold text-white text-lg">{p.name}</p></div>
          </label>
        ))}
      </div>
      <Button onClick={initializeArena} className="fixed bottom-10 left-1/2 -translate-x-1/2 h-16 px-12 text-xl shadow-2xl">Enter Arena</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Arena Control</h1>
          <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">{auctionQueue.length + unsoldQueue.length} In Queue</p>
        </div>
        <div className="flex gap-3">
          {auction?.status === "LIVE" && (
            <Button onClick={togglePause} className={`${auction?.paused ? 'bg-green-600' : 'bg-yellow-600'} h-12 px-6 font-black`}>
              {auction?.paused ? "RESUME" : "PAUSE"}
            </Button>
          )}
          <Button onClick={startPlayer} className="h-12 px-10 text-lg bg-blue-600">Next Player</Button>
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
        ) : (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-500">
            <h2 className="text-center text-slate-500 font-black uppercase tracking-[0.3em] mb-8">Next Up In The Arena</h2>
            {auction?.upcomingPlayer ? (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[40px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <PlayerCard player={auction.upcomingPlayer} />
                </div>
            ) : (
                <Card className="p-20 border-2 border-dashed border-white/5 flex flex-col items-center justify-center opacity-50">
                    <p className="text-4xl font-black text-slate-700 italic uppercase">Auction Completed</p>
                </Card>
            )}
          </div>
        )}
      </div>

      <TeamRosters />
      <SoldModal open={showSoldModal} {...soldData} onClose={() => setShowSoldModal(false)} />
    </div>
  );
}