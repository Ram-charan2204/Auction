import Card from "./ui/Card";

export default function PlayerCard({ player, compact = false }) {
  if (!player) return null;

  // Determine which stat containers to show based on the dynamic database role attribute
  const showBatting = player.role === "Batsman" || player.role === "All-Rounder";
  const showBowling = player.role === "Bowler" || player.role === "All-Rounder";

  return (
    <Card className="h-full p-6 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* IMAGE */}
        <div className="flex justify-center items-center">
          <img
            src={player.image || "/players/default.jpg"}
            alt={player.name}
            className={`object-cover rounded-3xl border border-white/10 ${
              compact ? "w-52 h-52" : "w-72 h-72"
            }`}
          />
        </div>

        {/* DETAILS */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-blue-500 uppercase">
              {player.role || "Player"}
            </span>
          </div>
          
          <h1 className={`font-black mb-4 truncate ${compact ? "text-4xl" : "text-6xl"}`}>
            {player.name}
          </h1>

          {/* BASE PRICE */}
          <div className="mb-6 inline-block w-max bg-yellow-500/20 border border-yellow-400/30 rounded-2xl px-6 py-3">
            <p className="text-yellow-300 text-lg font-bold">
              Base Price: ₹ {player.basePrice ?? 0}
            </p>
          </div>

          {/* STATS CONTAINERS */}
          <div className={`grid gap-4 ${showBatting && showBowling ? "grid-cols-2" : "grid-cols-1"}`}>
            {/* BATTING PANEL */}
            {showBatting && (
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-2xl p-5 animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold mb-4 text-blue-400">Batting</h2>
                <div className="space-y-2 text-base font-medium text-slate-300">
                  <p>Runs: <span className="text-white font-bold">{player?.batting?.runs ?? 0}</span></p>
                  <p>Strike Rate: <span className="text-white font-bold">{player?.batting?.sr ?? 0}</span></p>
                  <p>Average: <span className="text-white font-bold">{player?.batting?.avg ?? 0}</span></p>
                  <p>Sixes: <span className="text-white font-bold">{player?.batting?.sixes ?? 0}</span></p>
                  <p>Fours: <span className="text-white font-bold">{player?.batting?.fours ?? 0}</span></p>
                </div>
              </div>
            )}

            {/* BOWLING PANEL */}
            {showBowling && (
              <div className="bg-green-500/10 border border-green-400/20 rounded-2xl p-5 animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold mb-4 text-green-400">Bowling</h2>
                <div className="space-y-2 text-base font-medium text-slate-300">
                  <p>Overs: <span className="text-white font-bold">{player?.bowling?.overs ?? 0}</span></p>
                  <p>Economy: <span className="text-white font-bold">{player?.bowling?.eco ?? 0}</span></p>
                  <p>Wickets: <span className="text-white font-bold">{player?.bowling?.wickets ?? 0}</span></p>
                  <p>Maidens: <span className="text-white font-bold">{player?.bowling?.maidens ?? 0}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}