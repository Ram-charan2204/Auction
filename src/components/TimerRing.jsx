import { motion } from "framer-motion";

export default function TimerRing({ timeLeft }) {
  const danger = timeLeft <= 3;

  return (
    <motion.div
      animate={
        danger
          ? {
              scale: [1, 1.08, 1]
            }
          : {}
      }
      transition={{
        repeat: Infinity,
        duration: 0.8
      }}
      className={`
        w-44
        h-44
        rounded-full
        flex
        items-center
        justify-center
        text-6xl
        font-black
        italic
        tracking-tighter
        border-4
        shadow-2xl
        transition-colors
        duration-300
        ${
          danger
            ? "border-yellow-400 bg-yellow-500/20 text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            : "border-orange-500 bg-orange-600/20 text-white drop-shadow-[0_0_15px_rgba(249,115,22,0.15)]"
        }
      `}
    >
      {timeLeft}s
    </motion.div>
  );
}