import { motion } from "framer-motion";

export default function AnimatedBid({ bid }) {
  return (
    <motion.h1
      key={bid}
      initial={{
        scale: 0.7,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
      /* SRH OVERDRIVE: Transformed from text-blue-400 to bold sunrise yellow with a fiery orange glow effect */
      className="
        text-7xl
        font-black
        italic
        tracking-tighter
        text-yellow-400
        drop-shadow-[0_0_20px_rgba(255,83,22,0.4)]
      "
    >
      ₹ {bid?.toLocaleString() ?? 0}
    </motion.h1>
  );
}
