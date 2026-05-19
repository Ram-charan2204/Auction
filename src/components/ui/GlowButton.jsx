import { motion } from "framer-motion";

export default function GlowButton({
  children,
  className = "",
  ...props
}) {
  return (
    <motion.button
      whileHover={{
        scale: 1.05
      }}
      whileTap={{
        scale: 0.95
      }}
      {...props}
      className={`
        relative
        overflow-hidden
        px-10
        py-5
        rounded-2xl
        font-black
        text-lg
        uppercase
        tracking-wider
        italic
        text-white
        bg-orange-600
        border
        border-orange-500/20
        shadow-lg
        shadow-orange-600/40
        transition-all
        duration-300
        hover:shadow-orange-500/80
        cursor-pointer
        ${className}
      `}
    >
      <span className="relative z-10">
        {children}
      </span>

      {/* SRH FIERY HOVER OVERLAY MATRICES */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-orange-500
          to-amber-500
          opacity-0
          hover:opacity-100
          transition-opacity
          duration-300
        "
      />
    </motion.button>
  );
}