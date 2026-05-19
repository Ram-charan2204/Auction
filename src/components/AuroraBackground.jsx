import { motion } from "framer-motion";

export default function AuroraBackground() {
  return (
    <div
      className="
        absolute
        inset-0
        overflow-hidden
        -z-10
        bg-neutral-950
      "
    >
      {/* SRH ORANGE ORB - TOP LEFT AMBIENT FLOATER */}
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
          bg-orange-600/20
          rounded-full
          blur-[140px]
          top-[-200px]
          left-[-200px]
        "
      />

      {/* SUNRISE AMBER ORB - BOTTOM RIGHT AMBIENT FLOATER */}
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
          bg-amber-500/20
          rounded-full
          blur-[140px]
          bottom-[-150px]
          right-[-150px]
        "
      />

      {/* CORE RED FIERY FLAME ORB - CENTER CONTRAST FLOATER */}
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
          bg-red-600/10
          rounded-full
          blur-[140px]
          top-[30%]
          left-[40%]
        "
      />
    </div>
  );
}