import { motion } from "framer-motion";

export default function SpotlightBackground() {
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
      {/* SRH ORANGE FIERY ORB - TOP LEFT FLOAT SPOTLIGHT */}
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
          bg-orange-600/20
          blur-[120px]
        "
      />

      {/* SUNRISE AMBER GOLD ORB - BOTTOM RIGHT FLOAT SPOTLIGHT */}
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
          bg-amber-500/15
          blur-[120px]
        "
      />

      {/* COMPLEMENTARY AMBIENT VIGNETTE OVERLAY RADIAL GRADIENT */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.04),transparent_65%)]
        "
      />
    </div>
  );
}