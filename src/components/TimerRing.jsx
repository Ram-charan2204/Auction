import { motion }
from "framer-motion";

export default function TimerRing({
  timeLeft
}) {

  const danger =
    timeLeft <= 3;

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
      font-bold

      border-4

      shadow-2xl

      ${
        danger

          ? "border-red-500 bg-red-500/20"

          : "border-blue-500 bg-blue-500/20"
      }
    `}

    >

      {timeLeft}

    </motion.div>
  );
}