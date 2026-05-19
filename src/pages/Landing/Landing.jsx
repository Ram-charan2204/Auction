import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SpotlightBackground from "../../components/SpotlightBackground";
import AnimatedLogo from "../../components/AnimatedLogo";
import GlowButton from "../../components/ui/GlowButton";

export default function Landing() {
  const navigate = useNavigate();

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
        bg-neutral-950
      "
    >
      {/* SRH STYLE MATRIX: Swapped out cold aurora theme fields for orange spotlight highlights */}
      <SpotlightBackground />

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
          z-10
        "
      >
        {/* CORE OPERATIONAL ACCOUNT GATE BUTTON */}
        <GlowButton
          onClick={() => navigate("/login")}
        >
          Enter Auction
        </GlowButton>

        {/* SRH STYLING OVERRIDE: Swapped out cold purple elements for fiery sunset gold highlights */}
        <GlowButton
          onClick={() => navigate("/viewer")}
          className="
            bg-amber-600
            shadow-amber-600/50
            hover:shadow-amber-500/80
            border-amber-500/20
          "
        >
          Audience View
        </GlowButton>
      </motion.div>

    </div>
  );
}