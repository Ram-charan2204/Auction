import {
  useNavigate
}
  from "react-router-dom";

import {
  motion
}
  from "framer-motion";

import AuroraBackground
  from "../../components/AuroraBackground";

import AnimatedLogo
  from "../../components/AnimatedLogo";

import GlowButton
  from "../../components/ui/GlowButton";

export default function Landing() {

  const navigate =
    useNavigate();

  return (

    <div
      className="

      relative

      min-h-screen

      overflow-hidden

      flex
      flex-col

      items-center
      justify-center

      px-6
    "

    >

      <AuroraBackground />

      <AnimatedLogo />

      <motion.div

        initial={{
          opacity: 0,
          y: 50
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        transition={{
          delay: 0.8
        }}

        className="

        mt-20

        flex
        flex-col
        md:flex-row

        gap-6
      "

      >

        <GlowButton

          onClick={() =>
            navigate("/login")
          }

        >

          Enter Auction

        </GlowButton>

        <GlowButton

          onClick={() =>
            navigate("/viewer")
          }

          className="

          bg-purple-500

          shadow-purple-500/50

          hover:shadow-purple-400/80
        "

        >

          Audience View

        </GlowButton>

      </motion.div>

    </div>
  );
}