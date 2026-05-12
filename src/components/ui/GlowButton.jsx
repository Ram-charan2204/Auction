import {
  motion
}
from "framer-motion";

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

      font-bold
      text-lg

      bg-blue-500

      shadow-lg
      shadow-blue-500/50

      transition-all

      hover:shadow-blue-400/80

      ${className}
    `}

    >

      <span
        className="relative z-10">

        {children}

      </span>

      <div
        className="

        absolute
        inset-0

        bg-gradient-to-r

        from-blue-400
        to-purple-500

        opacity-0

        hover:opacity-100

        transition-opacity
      "

      />

    </motion.button>
  );
}