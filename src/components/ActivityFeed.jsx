import { motion } from "framer-motion";
import Card from "./ui/Card";

export default function ActivityFeed({ history }) {
  return (
    <Card className="p-6 h-full bg-zinc-900/60 border-orange-500/10 shadow-2xl flex flex-col text-white">
      {/* SRH HEADLINE ACCENT */}
      <h1 className="text-2xl font-black italic uppercase tracking-wider text-orange-500 mb-6 border-b border-zinc-800 pb-3">
        Live Activity Feed
      </h1>

      <div
        className="
          space-y-3
          max-h-[500px]
          overflow-y-auto
          pr-2
          flex-1
          custom-scrollbar
        "
      >
        {history?.length > 0 ? (
          history
            .slice()
            .reverse()
            .map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                // ITEM CONTAINER LAYER: Premium dark frosted badge rows with thin contrast lines
                className="
                  flex
                  items-center
                  justify-between
                  bg-black/40
                  border
                  border-zinc-900
                  hover:border-orange-500/20
                  rounded-xl
                  p-4
                  transition-all
                  duration-200
                "
              >
                <div className="space-y-1">
                  {/* BUYING TEAM: Remapped from text-blue-400 to bold neon orange */}
                  <h3 className="text-sm font-black uppercase tracking-wide text-orange-500 italic">
                    {item.team}
                  </h3>
                  {/* ACQUIRED PLAYER */}
                  <p className="text-sm font-bold text-white uppercase tracking-tight">
                    {item.player}
                  </p>
                </div>

                {/* FINAL STRIKE PRICE: Remapped to high-octane sunrise gold text badges */}
                <span className="text-base font-black text-yellow-400 bg-yellow-500/5 px-3 py-1 border border-yellow-400/20 rounded-lg">
                  ₹ {item.price?.toLocaleString() ?? 0}L
                </span>
              </motion.div>
            ))
        ) : (
          /* FALLBACK EMPTY STATUS SCREEN LAYOUT */
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800/80 rounded-2xl bg-black/5">
            <span className="text-2xl mb-2 filter grayscale opacity-40">📢</span>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-600">
              No auction history recorded yet
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}