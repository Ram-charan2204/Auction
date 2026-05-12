import {
  motion
}
from "framer-motion";

export default function AnimatedLogo() {

  return (

    <motion.div

      initial={{
        opacity: 0,
        scale: 0.5
      }}

      animate={{
        opacity: 1,
        scale: 1
      }}

      transition={{
        duration: 1
      }}

      className="text-center"
    >

      <motion.h1

        animate={{
          textShadow: [

            "0px 0px 20px #3b82f6",

            "0px 0px 40px #8b5cf6",

            "0px 0px 20px #3b82f6"
          ]
        }}

        transition={{
          duration: 3,
          repeat: Infinity
        }}

        className="

        text-8xl
        md:text-[120px]

        font-black

        tracking-widest
      "

      >

        BIT WARS

      </motion.h1>

      <motion.p

        initial={{
          opacity: 0,
          y: 20
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          delay: 0.5
        }}

        className="

        text-2xl

        text-slate-300

        mt-5
      "

      >

        The Ultimate Auction Arena

      </motion.p>

    </motion.div>
  );
}