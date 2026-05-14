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

  async function handleLogin() {
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
        // Route to Host Dashboard
        navigate("/host");
      } 
      else if (loggedInEmail.includes("team")) {
        // Extract teamId from email (e.g., "team1@gmail.com" -> "team1")
        const teamId = loggedInEmail.split("@")[0];
        navigate(`/team/${teamId}`);
      } 
      else {
        // Fallback for unauthorized emails
        alert("Unauthorized access. Please use a registered Team or Host account.");
        navigate("/");
      }
    } catch (err) {
      console.error("Login Error:", err.code);
      // Friendly error messages
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        alert("Invalid credentials. Please check your email and password.");
      } else {
        alert("Login failed: " + err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-slate-950">
      <SpotlightBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <GlassCard className="p-8 md:p-10 border-white/10">
          <div className="mb-10">
            <AnimatedLogo />
            <p className="text-center text-slate-400 text-sm mt-2 tracking-widest uppercase">
              Enter the Auction Arena
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Email Address
              </label>
              <InputField
                type="email"
                placeholder="host@gmail.com or team1@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Password
              </label>
              <InputField
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <GlowButton
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-14 text-lg mt-6 font-black tracking-tighter"
            >
              {isLoggingIn ? "AUTHENTICATING..." : "JOIN AUCTION"}
            </GlowButton>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate("/viewer")}
              className="text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Back to Audience View
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Decorative Blur Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -z-1" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] -z-1" />
    </div>
  );
}