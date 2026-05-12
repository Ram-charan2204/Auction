import { motion }
from "framer-motion";

export default function AnimatedBid({
  bid
}) {

  return (

    <motion.h1

      key={bid}

      initial={{
        scale: 0.7,
        opacity: 0
      }}

      animate={{
        scale: 1,
        opacity: 1
      }}

      transition={{
        duration: 0.3
      }}

      className="

      text-7xl
      font-bold

      text-blue-400

      drop-shadow-lg
    "

    >

      ₹ {bid}

    </motion.h1>
  );
}