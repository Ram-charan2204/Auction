import Card from "./ui/Card";

export default function PlayerCard({ player, compact = false }) {
  if (!player) return null;

  // Determine which stat containers to show based on the dynamic database role attribute
  const showBatting =
    player.role === "Batsman" || player.role === "All-Rounder";
  const showBowling = player.role === "Bowler" || player.role === "All-Rounder";

  return (
    <Card className="h-full p-6 overflow-hidden bg-zinc-900/60 border-orange-500/10 shadow-2xl text-white">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* IMAGE */}
        <div className="flex justify-center items-center">
          <img
            src={player.image || "/players/default.jpg"}
            alt={player.name}
            className={`object-cover rounded-3xl border border-zinc-800 shadow-md ${
              compact ? "w-52 h-52" : "w-72 h-72"
            }`}
          />
        </div>

        {/* DETAILS CONTAINER */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-1">
            <span className="text-xs font-black tracking-[0.2em] text-orange-500 uppercase italic">
              {player.role || "Player"}
            </span>
          </div>

          <h1
            className={`font-black mb-3 text-white uppercase italic tracking-tight truncate ${compact ? "text-4xl" : "text-6xl"}`}
          >
            {player.name}
          </h1>

          {/* DYNAMIC RATINGS MODULE ADDITION */}
          <div className="flex flex-wrap gap-2.5 mb-4 items-center">
            {/* Batting Rating Node Badge */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-black tracking-wide uppercase text-orange-400">
              <span>BAT ★</span>
              <span className="text-white bg-orange-600 px-1.5 py-0.5 rounded-md text-[11px]">
                {player.battingRating || "4.0"}
              </span>
            </div>
            {/* Bowling Rating Node Badge */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-black tracking-wide uppercase text-yellow-500">
              <span>BOWL ★</span>
              <span className="text-black bg-yellow-400 px-1.5 py-0.5 rounded-md text-[11px] font-black">
                {player.bowlingRating || "4.0"}
              </span>
            </div>
          </div>

          {/* BASE PRICE DISPLAY BADGE */}
          <div className="mb-5 inline-block w-max bg-yellow-500/5 border border-yellow-400/20 rounded-2xl px-5 py-2.5 shadow-sm">
            <p className="text-yellow-400 text-sm sm:text-base font-black uppercase tracking-wider">
              Base Price:{" "}
              <span className="text-white ml-1">₹ {player.basePrice ?? 0}</span>
            </p>
          </div>

          {/* STATS DETAILS SECTIONS */}
          <div
            className={`grid gap-4 ${showBatting && showBowling ? "grid-cols-2" : "grid-cols-1"}`}
          >
            {/* BATTING DATA PANEL */}
            {showBatting && (
              <div className="bg-black/30 border border-zinc-800 rounded-2xl p-4 animate-in fade-in duration-300">
                <h2 className="text-lg font-black uppercase italic tracking-wide mb-3 text-orange-500 border-b border-zinc-800/60 pb-1">
                  Batting
                </h2>
                <div className="space-y-1.5 text-xs sm:text-sm font-semibold text-zinc-400">
                  <p className="flex justify-between">
                    Runs:{" "}
                    <span className="text-white font-black">
                      {player?.batting?.runs ?? 0}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    Strike Rate:{" "}
                    <span className="text-white font-black">
                      {player?.batting?.sr ?? 0}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    Average:{" "}
                    <span className="text-white font-black">
                      {player?.batting?.avg ?? 0}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    Sixes:{" "}
                    <span className="text-white font-black">
                      {player?.batting?.sixes ?? 0}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    Fours:{" "}
                    <span className="text-white font-black">
                      {player?.batting?.fours ?? 0}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* BOWLING DATA PANEL */}
            {showBowling && (
              <div className="bg-black/30 border border-zinc-800 rounded-2xl p-4 animate-in fade-in duration-300">
                <h2 className="text-lg font-black uppercase italic tracking-wide mb-3 text-yellow-500 border-b border-zinc-800/60 pb-1">
                  Bowling
                </h2>
                <div className="space-y-1.5 text-xs sm:text-sm font-semibold text-zinc-400">
                  <p className="flex justify-between">
                    Overs:{" "}
                    <span className="text-white font-black">
                      {player?.bowling?.overs ?? 0}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    Economy:{" "}
                    <span className="text-white font-black">
                      {player?.bowling?.eco ?? 0}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    Wickets:{" "}
                    <span className="text-white font-black">
                      {player?.bowling?.wickets ?? 0}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    Maidens:{" "}
                    <span className="text-white font-black">
                      {player?.bowling?.maidens ?? 0}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
