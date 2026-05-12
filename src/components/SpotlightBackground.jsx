import {
  motion
}
from "framer-motion";

export default function SpotlightBackground() {

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
          x: [0, 150, 0],
          y: [0, 80, 0]
        }}

        transition={{
          duration: 10,
          repeat: Infinity
        }}

        className="

        absolute

        top-[-100px]
        left-[-100px]

        w-[500px]
        h-[500px]

        rounded-full

        bg-blue-500/20

        blur-[120px]
      "

      />

      <motion.div

        animate={{
          x: [0, -120, 0],
          y: [0, -60, 0]
        }}

        transition={{
          duration: 14,
          repeat: Infinity
        }}

        className="

        absolute

        bottom-[-150px]
        right-[-100px]

        w-[450px]
        h-[450px]

        rounded-full

        bg-purple-500/20

        blur-[120px]
      "

      />

      <div
        className="

        absolute
        inset-0

        bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]
      "

      />

    </div>
  );
}