import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SpotlightBackground from "../../components/SpotlightBackground";
import AnimatedLogo from "../../components/AnimatedLogo";
import GlowButton from "../../components/ui/GlowButton";
import GlassCard from "../../components/ui/GlassCard";
import InputField from "../../components/ui/InputField";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form submission handler that intercepts the Enter key event natively
  async function handleLogin(e) {
    if (e) e.preventDefault(); // Prevents the browser page from refreshing on form submit

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const loggedInEmail = userCredential.user.email.toLowerCase();

      // DYNAMIC ROUTING LOGIC
      if (loggedInEmail === "host@gmail.com") {
        navigate("/host");
      } 
      else if (loggedInEmail.includes("team")) {
        const teamId = loggedInEmail.split("@")[0];
        navigate(`/team/${teamId}`);
      } 
      else {
        alert("Unauthorized access. Please use a registered Team or Host account.");
        navigate("/");
      }
    } catch (err) {
      console.error("Login Error:", err.code);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        alert("Invalid credentials. Please check your email and password.");
      } else {
        alert("Login failed: " + err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    // SRH BACKGROUND: Swapped out slate-950 for premium deep neutral black canvas
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-neutral-950">
      <SpotlightBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* SRH STYLE GLASS CARD OVERLAY WITH ORANGE HIGHLIGHT BORDER */}
        <GlassCard className="p-8 md:p-10 border-orange-500/10 bg-zinc-900/40 backdrop-blur-2xl">
          <div className="mb-10">
            <AnimatedLogo />
            {/* BRANDING TINT OVERDRIVE */}
            <p className="text-center text-zinc-400 text-sm mt-2 tracking-widest uppercase font-semibold">
              Enter the BidWars Arena
            </p>
          </div>

          {/* Form wrapper catches any "Enter" keyboard strokes automatically */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-orange-500 uppercase ml-1 tracking-wider">
                Email Address
              </label>
              <InputField
                type="email"
                placeholder="host@gmail.com or team1@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:border-orange-500 focus:ring-orange-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-orange-500 uppercase ml-1 tracking-wider">
                Password
              </label>
              <InputField
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus:border-orange-500 focus:ring-orange-500/20"
              />
            </div>

            {/* ACTION TRIGGER DEPLOYMENT: Connected natively with SRH tokens */}
            <GlowButton
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-14 text-lg mt-6 font-black tracking-wider bg-orange-600 hover:bg-orange-500 text-white border-none shadow-lg shadow-orange-600/30 transition-all duration-300"
            >
              {isLoggingIn ? "AUTHENTICATING..." : "JOIN AUCTION"}
            </GlowButton>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate("/viewer")}
              className="text-zinc-500 hover:text-yellow-500 text-xs font-bold uppercase tracking-widest transition-colors duration-200"
            >
              Back to Audience View
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* SRH FIERY DECORATIVE BLUR FIELDS */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-orange-600/15 rounded-full blur-[120px] -z-1" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-[120px] -z-1" />
    </div>
  );
}