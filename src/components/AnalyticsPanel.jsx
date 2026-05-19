import Card from "./ui/Card";

export default function AnalyticsPanel({ teams }) {
  const sortedTeams = Object.values(teams || {}).sort(
    (a, b) => (b.players?.length || 0) - (a.players?.length || 0)
  );

  return (
    <Card className="p-6 bg-zinc-900/60 border-orange-500/10 shadow-2xl flex flex-col text-white">
      {/* SRH HEADLINE THEME ACCENT */}
      <h1 className="text-2xl font-black italic uppercase tracking-wider text-orange-500 mb-8 border-b border-zinc-800 pb-3">
        Team Analytics
      </h1>

      <div className="space-y-5">
        {sortedTeams.map((team, index) => (
          <div
            key={index}
            className="bg-black/40 border border-zinc-900 hover:border-orange-500/20 rounded-2xl p-5 transition-all duration-200"
          >
            <div className="flex justify-between items-center">
              {/* TEAM NAME LABEL */}
              <h2 className="text-xl font-black uppercase tracking-tight text-white italic">
                {team.name}
              </h2>

              {/* REMAINING TEAM PURSE: Converted to high-octane sunrise gold metrics */}
              <h2 className="text-yellow-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                ₹ {(team.purse || 0).toLocaleString()}
              </h2>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Squad Size
              </p>

              {/* TEAM ROSTER COUNT VALUE: Shifted from legacy text-blue-400 to bright SRH orange */}
              <p className="text-orange-500 font-black text-lg">
                {team.players?.length || 0}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}