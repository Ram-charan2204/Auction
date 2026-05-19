import { motion } from "framer-motion";

export default function ViewerHero({
  player,
  currentBid,
  highestBidder
}) {
  if (!player) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="
        relative
        overflow-hidden
        rounded-[32px]
        border
        border-orange-500/10
        bg-zinc-900/40
        backdrop-blur-xl
        p-10
        shadow-2xl
        text-white
      "
    >
      <div
        className="
          flex
          flex-col
          lg:flex-row
          gap-10
          items-center
        "
      >
        <img
          src={
            player.image ||
            "/players/default.jpg" ||
            'https://placehold.co/400'
          }
          alt={player.name}
          className="
            w-80
            h-80
            rounded-[24px]
            border
            border-zinc-800
            object-cover
            shadow-lg
          "
        />

        <div className="flex-1 text-center lg:text-left">
          <motion.h1
            animate={{
              /* SRH RADIANT TEXT GLOW: Re-mapped legacy blue/purple to hot orange and sunburst gold */
              textShadow: [
                '0px 0px 20px #f97316', // SRH Orange
                '0px 0px 40px #eab308', // Sunrise Gold Amber
                '0px 0px 20px #f97316'
              ]
            }}
            transition={{
              repeat: Infinity,
              duration: 3
            }}
            className="
              text-5xl
              sm:text-7xl
              font-black
              italic
              uppercase
              tracking-tight
            "
          >
            {player.name}
          </motion.h1>

          <div
            className="
              mt-8
              space-y-3
            "
          >
            {/* CURRENT STRIKE PRICE: Re-mapped from green to high-tension sunrise gold */}
            <h2
              className="
                text-5xl
                font-black
                text-yellow-400
                drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]
              "
            >
              ₹ {currentBid?.toLocaleString() ?? 0}L
            </h2>

            {/* HIGHEST BIDDER: Re-mapped from text-blue-400 to signature bold neon orange */}
            <h3
              className="
                text-2xl
                font-black
                uppercase
                tracking-wider
                italic
                text-orange-500
              "
            >
              {highestBidder || 'Waiting for opening bid'}
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
}