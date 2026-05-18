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
            {/* BRANDING FIXED: Adjusted spacing for cleaner UI layout matching your theme */}
            <p className="text-center text-slate-400 text-sm mt-2 tracking-widest uppercase">
              Enter the BidWars Arena
            </p>
          </div>

          {/* Form wrapper catches any "Enter" keyboard strokes on children nodes automatically */}
          <form onSubmit={handleLogin} className="space-y-5">
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

            {/* type="submit" links this execution node to the native form wrapper listener */}
            <GlowButton
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-14 text-lg mt-6 font-black tracking-tighter"
            >
              {isLoggingIn ? "AUTHENTICATING..." : "JOIN AUCTION"}
            </GlowButton>
          </form>

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