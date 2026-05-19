import { motion, AnimatePresence } from "framer-motion";

export default function SoldModal({
  open,
  sold,
  player,
  team,
  price,
  onClose
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed
            inset-0
            z-[100]
            bg-black/80
            backdrop-blur-xl
            flex
            items-center
            justify-center
          "
        >
          <motion.div
            initial={{
              scale: 0.5,
              opacity: 0,
              y: 100
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0
            }}
            exit={{
              scale: 0.5,
              opacity: 0
            }}
            transition={{
              type: "spring",
              damping: 15
            }}
            className="
              relative
              overflow-hidden
              w-[90%]
              max-w-2xl
              rounded-[32px]
              border
              border-orange-500/10
              bg-gradient-to-br
              from-neutral-900
              to-zinc-950
              p-10
              text-center
              shadow-[0_0_50px_rgba(0,0,0,0.8)]
              text-white
            "
          >
            {sold ? (
              <>
                {/* HAMMER HIT MOTION ANIMATION STATE */}
                <motion.div
                  animate={{
                    rotate: [0, -20, 20, -10, 10, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="
                    text-7xl
                    mb-4
                    drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]
                  "
                >
                  🔨
                </motion.div>

                {/* STATUS TITLE MATCHED TO RICH EMERALD GREEN FOR VALID SALES */}
                <motion.h1
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="
                    text-6xl
                    sm:text-7xl
                    font-black
                    italic
                    tracking-tighter
                    text-emerald-400
                    drop-shadow-[0_0_20px_rgba(52,211,153,0.2)]
                  "
                >
                  SOLD
                </motion.h1>

                {/* PLAYER UNIQUE IDENTITY */}
                <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight mt-6">
                  {player}
                </h2>

                {/* THEMED ALLOCATED TARGET BIDDER UNIT */}
                <p className="text-xl text-zinc-400 mt-3 font-semibold uppercase tracking-wider">
                  Acquired by{" "}
                  <span className="font-black text-orange-500 italic block sm:inline mt-1 sm:mt-0 text-2xl">
                    {team}
                  </span>
                </p>

                {/* PREMIUM SUNRISE GOLD PRICE ANCHOR METRICS */}
                <motion.h2
                  animate={{
                    scale: [1, 1.04, 1]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5
                  }}
                  className="
                    text-5xl
                    sm:text-6xl
                    font-black
                    text-yellow-400
                    drop-shadow-[0_0_25px_rgba(234,179,8,0.35)]
                    mt-6
                  "
                >
                  ₹ {price?.toLocaleString() ?? 0}L
                </motion.h2>
              </>
            ) : (
              <>
                {/* UNSOLD AXE OPERATION ANIMATION */}
                <motion.div
                  animate={{
                    rotate: [0, 15, -15, 10, -10, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="
                    text-7xl
                    mb-4
                    drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]
                  "
                >
                  🪓
                </motion.div>

                {/* HIGH CONTRAST CRIMSON FLAG ELEMENT */}
                <motion.h1
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="
                    text-6xl
                    sm:text-7xl
                    font-black
                    italic
                    tracking-tighter
                    text-red-500
                    drop-shadow-[0_0_20px_rgba(239,68,68,0.2)]
                  "
                >
                  UNSOLD
                </motion.h1>

                <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight mt-6">
                  {player}
                </h2>

                <p className="text-base font-bold text-zinc-500 uppercase tracking-widest mt-4 max-w-sm mx-auto leading-relaxed">
                  No active franchise pool strikes matched this asset loop turn.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}