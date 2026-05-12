import {
  motion
}
from "framer-motion";

export default function AuroraBackground() {

  return (

    <div
      className="

      absolute
      inset-0

      overflow-hidden

      -z-10
    "

    >

      <motion.div

        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0]
        }}

        transition={{
          duration: 12,
          repeat: Infinity
        }}

        className="

        absolute

        w-[600px]
        h-[600px]

        bg-blue-500/20

        rounded-full

        blur-[140px]

        top-[-200px]
        left-[-200px]
      "

      />

      <motion.div

        animate={{
          x: [0, -120, 0],
          y: [0, 120, 0]
        }}

        transition={{
          duration: 15,
          repeat: Infinity
        }}

        className="

        absolute

        w-[500px]
        h-[500px]

        bg-purple-500/20

        rounded-full

        blur-[140px]

        bottom-[-150px]
        right-[-150px]
      "

      />

      <motion.div

        animate={{
          x: [0, 80, 0],
          y: [0, 80, 0]
        }}

        transition={{
          duration: 18,
          repeat: Infinity
        }}

        className="

        absolute

        w-[400px]
        h-[400px]

        bg-pink-500/20

        rounded-full

        blur-[140px]

        top-[30%]
        left-[40%]
      "

      />

    </div>
  );
}