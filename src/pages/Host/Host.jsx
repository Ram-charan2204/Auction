import {
  ref,
  update,
  get,
  push,
  set,
  remove,
  onValue,
} from "firebase/database";

import { useEffect, useState } from "react";

import SoldModal from "../../components/SoldModal";

import { db } from "../../firebase/firebase";

import useAuction from "../../hooks/useAuction";

import PlayerCard from "../../components/PlayerCard";

import AnimatedBid from "../../components/AnimatedBid";

import Button from "../../components/ui/Button";

import Card from "../../components/ui/Card";

export default function Host() {
  const auction = useAuction();

  // Workflow Steps: 0 (Settings/Admin Dashboard), 1 (Captains), 2 (Pool Selection), 3 (Live Arena)

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

  // Dynamic Live Players loaded directly from Firebase Cloud Engine

  const [cloudPlayers, setCloudPlayers] = useState([]);

  const [editingPlayerId, setEditingPlayerId] = useState(null);

  const [editForm, setEditForm] = useState({
    basePrice: 0,
    battingRating: 0,
    bowlingRating: 0,
    runs: 0,
    sr: 0,
    wickets: 0,
    eco: 0,
  });

  const [addForm, setAddForm] = useState({
    name: "",

    role: "Batsman",

    basePrice: "",

    battingRating: "4.0",

    bowlingRating: "4.0",

    runs: "",

    sr: "",

    wickets: "",

    eco: "",
  });

  // 1. Sync Server Offset, Teams Data, and Master Cloud Players Node

  useEffect(() => {
    onValue(ref(db, ".info/serverTimeOffset"), (snap) => {
      setServerOffset(snap.val() || 0);
    });

    onValue(ref(db, "teams"), (snap) => {
      setAllTeams(snap.val() || {});
    });

    onValue(ref(db, "masterPlayers"), (snap) => {
      if (snap.exists()) {
        const data = snap.val();

        let parsed = [];

        if (Array.isArray(data)) {
          parsed = data.filter(
            (p) =>
              p !== null && p !== undefined && typeof p === "object" && p.id,
          );
        } else {
          parsed = Object.values(data).filter((p) => p && p.id);
        }

        parsed.sort((a, b) => a.id - b.id);

        setCloudPlayers(parsed);
      } else {
        setCloudPlayers([]);
      }
    });
  }, []);

  // 2. Synchronized Global Timer Loop

  useEffect(() => {
    if (auction?.status !== "LIVE" || !auction?.timerEnd || auction?.paused)
      return;

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

  // --- WEEKLY CLOUD MANAGEMENT CONTROLS ---

  const handleStartEdit = (p) => {
    setEditingPlayerId(p.id);

    setEditForm({
      basePrice: p.basePrice || 1000,

      battingRating: p.battingRating || 4.0,

      bowlingRating: p.bowlingRating || 4.0,

      runs: p.batting?.runs || 0,

      sr: p.batting?.sr || 0,

      wickets: p.bowling?.wickets || 0,

      eco: p.bowling?.eco || 0,
    });
  };

  const savePlayerStats = async (id) => {
    const snap = await get(ref(db, "masterPlayers"));

    if (!snap.exists()) return;

    const dbData = snap.val();

    let targetDbKey = null;

    if (Array.isArray(dbData)) {
      targetDbKey = dbData.findIndex((p) => p && p.id === id);
    } else {
      targetDbKey = Object.keys(dbData).find(
        (k) => dbData[k] && dbData[k].id === id,
      );
    }

    if (targetDbKey === -1 || targetDbKey === null || targetDbKey === undefined)
      return;

    await update(ref(db, `masterPlayers/${targetDbKey}`), {
      basePrice: Number(editForm.basePrice),

      battingRating: Number(editForm.battingRating),

      bowlingRating: Number(editForm.bowlingRating),
    });

    await update(ref(db, `masterPlayers/${targetDbKey}/batting`), {
      runs: Number(editForm.runs),

      sr: Number(editForm.sr),
    });

    await update(ref(db, `masterPlayers/${targetDbKey}/bowling`), {
      wickets: Number(editForm.wickets),

      eco: Number(editForm.eco),
    });

    setEditingPlayerId(null);
  };

  const handleDeletePlayer = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this player entry permanently from the database?",
      )
    )
      return;

    const snap = await get(ref(db, "masterPlayers"));

    if (!snap.exists()) return;

    const dbData = snap.val();

    let targetDbKey = null;

    if (Array.isArray(dbData)) {
      targetDbKey = dbData.findIndex((p) => p && p.id === id);
    } else {
      targetDbKey = Object.keys(dbData).find(
        (k) => dbData[k] && dbData[k].id === id,
      );
    }

    if (targetDbKey === -1 || targetDbKey === null || targetDbKey === undefined)
      return;

    await remove(ref(db, `masterPlayers/${targetDbKey}`));
  };

  const handleAddPlayerSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.name || !addForm.basePrice) {
      alert("Please configure a valid Full Name and Base Price threshold!");

      return;
    }

    const snap = await get(ref(db, "masterPlayers"));

    let nextIndex = 0;

    let nextId = 1;

    if (snap.exists()) {
      const dbData = snap.val();

      const itemsList = Array.isArray(dbData) ? dbData : Object.values(dbData);

      nextIndex = Array.isArray(dbData)
        ? dbData.length
        : Object.keys(dbData).length;

      nextId =
        itemsList.length > 0
          ? Math.max(...itemsList.filter((p) => p).map((p) => p.id || 0)) + 1
          : 1;
    }

    const payload = {
      id: nextId,

      name: addForm.name,

      role: addForm.role,

      basePrice: Number(addForm.basePrice),

      battingRating: Number(addForm.battingRating) || 4.0,

      bowlingRating: Number(addForm.bowlingRating) || 4.0,

      image: "/players/default.jpg",

      batting: {
        runs: Number(addForm.runs) || 0,
        sr: Number(addForm.sr) || 0,
        avg: 0,
        fours: 0,
        sixes: 0,
      },

      bowling: {
        wickets: Number(addForm.wickets) || 0,
        eco: Number(addForm.eco) || 0,
        maidens: 0,
        overs: 0,
        runs: 0,
      },
    };

    await set(ref(db, `masterPlayers/${nextIndex}`), payload);

    setAddForm({
      name: "",
      role: "Batsman",
      basePrice: "",
      battingRating: "4.0",
      bowlingRating: "4.0",
      runs: "",
      sr: "",
      wickets: "",
      eco: "",
    });
  };

  // --- ORIGINAL FUNCTIONALITY PRESERVED ---

  const handleNewAuction = async () => {
    if (cloudPlayers.length === 0)
      return alert("Your cloud database masterPlayers list is empty!");

    if (
      !window.confirm("Start New Auction? This resets transaction histories.")
    )
      return;

    await remove(ref(db, "history"));

    await set(ref(db, "settings"), { maxTeamSize: Number(maxTeamSize) });

    await set(ref(db, "auction"), {
      status: "IDLE",

      currentBid: 0,

      paused: false,

      currentPlayer: null,

      upcomingPlayer: null,

      highestBidder: "",
    });

    await set(ref(db, "teams"), {
      team1: { name: "Team 1", purse: 41000, players: [] },

      team2: { name: "Team 2", purse: 41000, players: [] },

      team3: { name: "Team 3", purse: 41000, players: [] },
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
      const player = cloudPlayers.find((p) => String(p.id) === String(pId));

      await update(ref(db, `teams/${teamId}`), {
        purse: Number(currentTeams[teamId].purse) - 1000,

        players: [{ ...player, price: 1000, isCaptain: true }],
      });
    }

    setStep(2);
  };

  // TO FIX POOL LOSS: Standardizes strict data type string parsing to prevent inclusion failure

  const initializeArena = async () => {
    if (selectedIds.length === 0) return alert("Select players for the pool!");

    // Ensure we are filtering by matching the Number ID
    const selected = cloudPlayers.filter((p) =>
      selectedIds.includes(Number(p.id)),
    );

    const order = ["All-Rounder", "Batsman", "Bowler"];

    const finalized = order.flatMap((role) =>
      selected.filter((p) => p.role === role).sort(() => Math.random() - 0.5),
    );

    setAuctionQueue(finalized);

    // Critical: Persist the queue to Firebase so the "Players Remaining" count updates
    await update(ref(db, "auction"), {
      upcomingPlayer: finalized[0] || null,
    });

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
      await update(ref(db, "auction"), {
        status: "COMPLETED",

        currentPlayer: null,

        upcomingPlayer: null,
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

      paused: false,
    });
  };

  const togglePause = async () => {
    if (auction?.status !== "LIVE") return;

    const trueNow = Date.now() + serverOffset;

    if (!auction.paused) {
      const remaining = auction.timerEnd - trueNow;

      await update(ref(db, "auction"), {
        paused: true,
        remainingTime: remaining,
      });
    } else {
      await update(ref(db, "auction"), {
        paused: false,

        timerEnd: trueNow + auction.remainingTime,
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

      const teamKey = Object.keys(teams).find((k) => teams[k].name === soldTo);

      const updated = [
        ...(teams[teamKey].players || []),
        { ...cur.currentPlayer, price: cur.currentBid },
      ];

      await update(ref(db, `teams/${teamKey}`), {
        purse: Number(teams[teamKey].purse) - cur.currentBid,

        players: updated,
      });
    } else {
      setUnsoldQueue((prev) => [...prev, cur.currentPlayer]);
    }

    await push(ref(db, "history"), {
      player: cur.currentPlayer.name,

      team: soldTo || "Unsold",

      price: soldTo ? cur.currentBid : 0,
    });

    setSoldData({
      sold: !!soldTo,
      player: cur.currentPlayer.name,
      team: soldTo,
      price: cur.currentBid,
    });

    setShowSoldModal(true);

    await update(ref(db, "auction"), { status: "ENDED" });

    setTimeout(async () => {
      setShowSoldModal(false);

      const nextUp = auctionQueue[0] || unsoldQueue[0] || null;

      await update(ref(db, "auction"), {
        status: "IDLE",

        currentPlayer: null,

        upcomingPlayer: nextUp,
      });
    }, 5000);
  }

  const FinalResults = () => (
    <div className="w-full max-w-6xl animate-in fade-in zoom-in duration-1000">
      <div className="text-center mb-10">
        <h2 className="text-6xl font-black text-white italic uppercase mb-2 bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
          Auction Completed
        </h2>

        <div className="h-1 w-24 bg-orange-500 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => {
          const team = allTeams[`team${i}`];

          return (
            <Card
              key={i}
              className="bg-zinc-900/60 border-orange-500/10 p-5 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                <h3 className="text-xl font-black text-orange-500 uppercase italic tracking-wide">
                  {team?.name}
                </h3>

                <span className="text-yellow-400 font-black">
                  ₹{team?.purse?.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {team?.players?.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-xs"
                  >
                    <span className="text-white font-bold">{p.name}</span>

                    <span className="text-yellow-500 font-black">
                      ₹{p.price}
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
    <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-orange-500/10 w-full">
      {[1, 2, 3].map((i) => {
        const team = allTeams[`team${i}`];

        return (
          <Card
            key={i}
            className="bg-zinc-900/40 p-4 border-orange-500/10 flex flex-col min-h-[160px]"
          >
            <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2">
              <h4 className="text-orange-500 font-black uppercase tracking-wider text-[10px] italic">
                {team?.name || `Team ${i}`}
              </h4>

              <span className="text-yellow-400 font-black text-xs">
                ₹{(team?.purse || 0).toLocaleString()}
              </span>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {team?.players?.map((p, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-[10px] bg-zinc-950/50 p-1.5 rounded border border-zinc-900"
                >
                  <span className="text-zinc-300 truncate w-32 font-semibold">
                    {p.name}
                  </span>

                  <span className="text-yellow-500 font-black">₹{p.price}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );

  if (step === 0)
    return (
      <div className="min-h-screen bg-neutral-950 p-6 flex flex-col gap-8 max-w-[1700px] mx-auto w-full justify-center select-none text-white">
        <div className="flex items-center gap-3 border-b border-orange-500/10 pb-4">
          <div className="w-3 h-7 bg-orange-600 rounded" />

          <h1 className="text-3xl font-black uppercase italic tracking-wider bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
            ARENA CONTROL
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-4 space-y-6">
            <Card className="p-6 bg-zinc-900/60 border-orange-500/10 text-center flex flex-col justify-between min-h-[220px] shadow-xl">
              <div>
                <h2 className="text-orange-500 text-lg font-black mb-4 italic uppercase tracking-wider text-left border-b border-zinc-800 pb-2">
                  BidWars Setup
                </h2>

                <div className="text-left mb-4">
                  <label className="text-zinc-500 text-[10px] font-black uppercase mb-1.5 block tracking-widest">
                    Max Squad Size Limit
                  </label>

                  <input
                    type="number"
                    className="w-full p-3 h-12 bg-zinc-950 border border-orange-500/10 rounded-xl text-white outline-none font-bold focus:border-orange-500 transition-all"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleNewAuction}
                className="w-full h-14 text-base font-black uppercase tracking-wider bg-gradient-to-b from-orange-500 to-orange-700 border-none shadow-md"
              >
                Initialize Tournament
              </Button>
            </Card>

            <Card className="p-6 bg-zinc-900/60 border-orange-500/10 shadow-xl">
              <h2 className="text-orange-500 text-lg font-black mb-4 italic uppercase tracking-wider border-b border-zinc-800 pb-2">
                Add New Player
              </h2>

              <form onSubmit={handleAddPlayerSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Mitchell Starc"
                    value={addForm.name}
                    className="w-full h-11 px-3 bg-zinc-950 border border-orange-500/10 rounded-xl outline-none text-xs focus:border-orange-500 transition-all font-medium"
                    onChange={(e) =>
                      setAddForm({ ...addForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Core Role
                    </label>

                    <select
                      value={addForm.role}
                      className="w-full h-11 px-2 bg-zinc-950 border border-orange-500/10 rounded-xl outline-none text-xs font-bold text-white focus:border-orange-500"
                      onChange={(e) =>
                        setAddForm({ ...addForm, role: e.target.value })
                      }
                    >
                      <option value="Batsman">Batsman</option>

                      <option value="Bowler">Bowler</option>

                      <option value="All-Rounder">All-Rounder</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Base Price (₹)
                    </label>

                    <input
                      type="number"
                      placeholder="2000"
                      value={addForm.basePrice}
                      className="w-full h-11 px-3 bg-zinc-950 border border-orange-500/10 rounded-xl outline-none text-xs focus:border-orange-500 transition-all font-bold"
                      onChange={(e) =>
                        setAddForm({ ...addForm, basePrice: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-black/20 p-2.5 rounded-xl border border-zinc-900">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-orange-400">
                      Bat Rating ★
                    </label>

                    <input
                      type="text"
                      placeholder="4.5"
                      value={addForm.battingRating}
                      className="w-full h-9 px-2 bg-zinc-950 border border-orange-500/10 rounded-lg outline-none text-xs font-bold"
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          battingRating: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-yellow-400">
                      Bowl Rating ★
                    </label>

                    <input
                      type="text"
                      placeholder="4.0"
                      value={addForm.bowlingRating}
                      className="w-full h-9 px-2 bg-zinc-950 border border-orange-500/10 rounded-lg outline-none text-xs font-bold"
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          bowlingRating: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900 text-xs font-medium">
                  <input
                    type="number"
                    placeholder="Runs"
                    value={addForm.runs}
                    className="h-9 bg-zinc-955 border border-orange-500/5 rounded text-center text-[11px]"
                    onChange={(e) =>
                      setAddForm({ ...addForm, runs: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="S/R"
                    value={addForm.sr}
                    className="h-9 bg-zinc-955 border border-orange-500/5 rounded text-center text-[11px]"
                    onChange={(e) =>
                      setAddForm({ ...addForm, sr: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Wkts"
                    value={addForm.wickets}
                    className="h-9 bg-zinc-955 border border-orange-500/5 rounded text-center text-[11px]"
                    onChange={(e) =>
                      setAddForm({ ...addForm, wickets: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="E/R"
                    value={addForm.eco}
                    className="h-9 bg-zinc-955 border border-orange-500/5 rounded text-center text-[11px]"
                    onChange={(e) =>
                      setAddForm({ ...addForm, eco: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-orange-600 to-amber-600 shadow-md transition-all hover:opacity-90"
                >
                  + Push Player Down The Wire
                </Button>
              </form>
            </Card>
          </div>

          <Card className="col-span-8 p-6 bg-zinc-900/60 border-orange-500/10 h-[680px] flex flex-col shadow-2xl">
            <div className="border-b border-zinc-800 pb-3 mb-4 flex justify-between items-center">
              <h3 className="text-sm font-black tracking-widest text-zinc-400 uppercase">
                Live Inventory Core Node Matrix
              </h3>

              <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-xl font-black">
                {cloudPlayers.length} Active Records
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {cloudPlayers.map((p) => (
                <div
                  key={p.id}
                  className="bg-black/40 border border-zinc-900 p-3 rounded-xl flex justify-between items-center text-sm hover:border-orange-500/20 transition-all"
                >
                  <div className="w-[28%] flex-shrink-0 pr-2">
                    <p className="font-black text-white uppercase tracking-tight truncate max-w-[180px]">
                      {p.name}
                    </p>

                    <p className="text-[9px] font-black uppercase text-orange-500 bg-orange-500/5 px-1.5 py-0.5 rounded w-max tracking-wider mt-1 whitespace-normal break-words max-w-full leading-normal">
                      {p.role}
                    </p>
                  </div>

                  {editingPlayerId === p.id ? (
                    <div className="flex items-center gap-1.5 w-[72%] justify-end animate-in fade-in duration-200">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-yellow-500 uppercase mb-0.5">
                          Base
                        </span>

                        <input
                          type="number"
                          value={editForm.basePrice}
                          className="w-14 h-8 bg-zinc-950 rounded-lg text-center text-xs border border-orange-500/20 text-white font-bold outline-none"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              basePrice: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-orange-400 uppercase mb-0.5">
                          Bat★
                        </span>

                        <input
                          type="text"
                          value={editForm.battingRating}
                          className="w-10 h-8 bg-zinc-950 rounded-lg text-center text-xs border border-orange-500/20 text-white font-bold outline-none"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              battingRating: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-yellow-400 uppercase mb-0.5">
                          Bowl★
                        </span>

                        <input
                          type="text"
                          value={editForm.bowlingRating}
                          className="w-10 h-8 bg-zinc-950 rounded-lg text-center text-xs border border-orange-500/20 text-white font-bold outline-none"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              bowlingRating: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase mb-0.5">
                          Runs
                        </span>

                        <input
                          type="number"
                          value={editForm.runs}
                          className="w-11 h-8 bg-zinc-950 rounded-lg text-center text-xs border border-zinc-800 text-white outline-none"
                          onChange={(e) =>
                            setEditForm({ ...editForm, runs: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase mb-0.5">
                          S/R
                        </span>

                        <input
                          type="number"
                          value={editForm.sr}
                          className="w-11 h-8 bg-zinc-950 rounded-lg text-center text-xs border border-zinc-800 text-white outline-none"
                          onChange={(e) =>
                            setEditForm({ ...editForm, sr: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase mb-0.5">
                          Wkts
                        </span>

                        <input
                          type="number"
                          value={editForm.wickets}
                          className="w-11 h-8 bg-zinc-950 rounded-lg text-center text-xs border border-zinc-800 text-white outline-none"
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              wickets: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase mb-0.5">
                          E/R
                        </span>

                        <input
                          type="number"
                          value={editForm.eco}
                          className="w-11 h-8 bg-zinc-950 rounded-lg text-center text-xs border border-zinc-800 text-white outline-none"
                          onChange={(e) =>
                            setEditForm({ ...editForm, eco: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex gap-1 pl-1">
                        <button
                          type="button"
                          onClick={() => savePlayerStats(p.id)}
                          className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white uppercase tracking-wide transition-all shadow"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingPlayerId(null)}
                          className="h-8 px-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-400"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ) : (
                    // FIX: Applied direct grid matrix tracks to provide fixed widths and completely clear layouts overlap

                    <div className="flex items-center justify-between w-[72%] pl-2 gap-2">
                      <div className="flex items-center justify-between text-center text-[11px] text-zinc-400 font-semibold w-full">
                        <div className="w-2/12 text-yellow-400 font-bold">
                          Base:
                          <span className="text-white font-bold block text-xs mt-0.5">
                            ₹{p.basePrice || 0}
                          </span>
                        </div>

                        <div className="w-1/12 text-orange-400 font-bold">
                          Bat★:
                          <span className="text-white block font-black text-xs mt-0.5">
                            {p.battingRating || "4.0"}
                          </span>
                        </div>

                        <div className="w-1/12 text-yellow-500 font-bold">
                          Bowl★:
                          <span className="text-white block font-black text-xs mt-0.5">
                            {p.bowlingRating || "4.0"}
                          </span>
                        </div>

                        <div className="w-2/12">
                          Runs:
                          <span className="text-zinc-200 block font-bold text-xs mt-0.5">
                            {p.batting?.runs || 0}
                          </span>
                        </div>

                        <div className="w-2/12">
                          S/R:
                          <span className="text-zinc-200 block font-bold text-xs mt-0.5">
                            {p.batting?.sr || 0}
                          </span>
                        </div>

                        <div className="w-2/12">
                          Wkts:
                          <span className="text-zinc-200 block font-bold text-xs mt-0.5">
                            {p.bowling?.wickets || 0}
                          </span>
                        </div>

                        <div className="w-2/12">
                          E/R:
                          <span className="text-zinc-200 block font-bold text-xs mt-0.5">
                            {p.bowling?.eco || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="text-xs font-black text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition-all uppercase tracking-wide"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeletePlayer(p.id)}
                          className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-600 hover:text-red-400 transition-colors text-sm"
                          title="Delete Permanent Node"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );

  if (step === 1)
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6">
        <Card className="w-full max-w-2xl p-8 bg-zinc-900/60 border-orange-500/10 shadow-2xl">
          <h2 className="text-3xl font-black mb-6 text-white text-center uppercase italic tracking-wide">
            Assign Captains
          </h2>

          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <select
                key={n}
                value={captains[`team${n}`]}
                className="w-full h-14 px-4 rounded-2xl text-white bg-zinc-950 border border-zinc-800 outline-none font-bold focus:border-orange-500 text-xs sm:text-sm transition-all"
                onChange={(e) =>
                  setCaptains({ ...captains, [`team${n}`]: e.target.value })
                }
              >
                <option value="">Captain for Team {n}</option>

                {cloudPlayers.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={Object.values(captains)
                      .map(String)
                      .includes(String(p.id))}
                  >
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            ))}
          </div>

          <Button
            onClick={handleCaptainSelection}
            className="w-full h-14 mt-10 font-black uppercase tracking-wider bg-gradient-to-r from-orange-600 to-orange-700 border-none shadow-md"
          >
            Confirm Captains
          </Button>
        </Card>
      </div>
    );

  if (step === 2)
    return (
      <div className="min-h-screen p-10 bg-neutral-950 text-center text-white">
        <h1 className="text-5xl font-black text-white mb-10 uppercase italic tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
          Selection Pool
        </h1>

        <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto mb-24">
          {cloudPlayers
            .filter(
              (p) =>
                !Object.values(captains).map(String).includes(String(p.id)),
            )
            .map((p) => {
              const isSelected = selectedIds.includes(Number(p.id));
              return (
                <label
                  key={p.id}
                  className={`p-5 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${isSelected ? "border-orange-500 bg-orange-600/10 shadow-lg" : "border-orange-500/5 bg-zinc-900/40"}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                    onChange={() => {
                      const id = Number(p.id);
                      setSelectedIds((prev) =>
                        prev.includes(id)
                          ? prev.filter((i) => i !== id)
                          : [...prev, id],
                      );
                    }}
                  />
                  <div className="text-left">
                    <p className="font-black text-white text-lg tracking-tight uppercase italic">
                      {p.name}
                    </p>
                    <p className="text-orange-500 text-xs font-black uppercase tracking-wider mt-0.5">
                      {p.role}
                    </p>
                  </div>
                </label>
              );
            })}
        </div>

        <Button
          onClick={initializeArena}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 h-16 px-12 text-xl font-black uppercase tracking-widest bg-gradient-to-b from-orange-500 to-orange-700 border-none shadow-2xl"
        >
          Start Arena
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-8 flex flex-col justify-between select-none">
      <div className="flex justify-between items-center mb-6 border-b border-orange-500/10 pb-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tight">
            Arena Control
          </h1>

          <p className="text-orange-500 text-sm font-black uppercase tracking-widest mt-1">
            {auctionQueue.length + unsoldQueue.length} Players Remaining
          </p>
        </div>

        <div className="flex gap-3">
          {auction?.status === "LIVE" && (
            <Button
              onClick={togglePause}
              className={`${auction?.paused ? "bg-emerald-600" : "bg-amber-600"} h-12 px-6 font-black uppercase border-none`}
            >
              {auction?.paused ? "Resume" : "Pause"}
            </Button>
          )}

          <Button
            onClick={startPlayer}
            className="h-12 px-10 text-base bg-orange-600 font-black uppercase tracking-wider border-none hover:bg-orange-500 shadow-md"
          >
            Next Player
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {auction?.status === "LIVE" ? (
          <div className="w-full grid grid-cols-2 gap-8 items-center max-w-[1400px]">
            <PlayerCard player={auction.currentPlayer} compact={true} />

            <div className="flex flex-col gap-6 justify-center w-full">
              <Card className="p-10 bg-zinc-900/40 border-orange-500/5 flex flex-col items-center justify-center shadow-lg">
                <span className="text-8xl font-black text-white italic tracking-tighter">
                  {localTimeLeft}s
                </span>

                <p className="text-zinc-500 uppercase font-black tracking-widest mt-2 text-xs">
                  Remaining
                </p>
              </Card>

              <Card className="p-10 bg-zinc-900/40 flex flex-col items-center justify-center border-orange-500/20 shadow-lg">
                <AnimatedBid bid={auction.currentBid} />

                <p className="text-orange-500 font-black mt-4 uppercase tracking-widest text-sm italic">
                  {auction.highestBidder || "No Active Strikes"}
                </p>
              </Card>
            </div>
          </div>
        ) : auction?.status === "COMPLETED" ? (
          <FinalResults />
        ) : (
          <div className="w-full max-w-4xl text-center">
            <h2 className="text-zinc-700 font-black uppercase tracking-[0.4em] mb-8 italic text-sm">
              Next In Queue
            </h2>

            {auction?.upcomingPlayer ? (
              <div className="opacity-30 scale-95 transition-all grayscale blur-[0.5px] pointer-events-none">
                <PlayerCard player={auction.upcomingPlayer} compact={true} />
              </div>
            ) : (
              <h3 className="text-2xl font-black text-zinc-800 uppercase italic tracking-widest animate-pulse">
                Next Deck Synced...
              </h3>
            )}
          </div>
        )}
      </div>

      {auction?.status !== "COMPLETED" && <TeamRosters />}

      <SoldModal
        open={showSoldModal}
        {...soldData}
        onClose={() => setShowSoldModal(false)}
      />
    </div>
  );
}
