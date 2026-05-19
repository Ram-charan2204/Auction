import { motion } from "framer-motion";

export default function AnimatedLogo() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.5
      }}
      animate={{
        opacity: 1,
        scale: 1
      }}
      transition={{
        duration: 1
      }}
      className="text-center select-none"
    >
      <motion.h1
        animate={{
          /* SRH EMBEDDED NEON PULSE: Swapped out legacy blue and purple glow arrays for fiery team tones */
          textShadow: [
            "0px 0px 20px #f97316", // SRH Matte Orange
            "0px 0px 40px #eab308", // Sunrise Gold Glow
            "0px 0px 20px #f97316"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity
        }}
        className="
          text-8xl
          md:text-[120px]
          font-black
          tracking-widest
          italic
          text-white
        "
      >
        BID WARS
      </motion.h1>

      <motion.p
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.5
        }}
        className="
          text-xl
          md:text-2xl
          text-zinc-400
          font-bold
          uppercase
          tracking-widest
          mt-5
        "
      >
        The Ultimate Auction Arena
      </motion.p>
    </motion.div>
  );
}