import {
  useState
}
from "react";

import {
  signInWithEmailAndPassword
}
from "firebase/auth";

import {
  auth
}
from "../../firebase/firebase";

import {
  useNavigate
}
from "react-router-dom";

import {
  motion
}
from "framer-motion";

import SpotlightBackground
from "../../components/SpotlightBackground";

import AnimatedLogo
from "../../components/AnimatedLogo";

import GlowButton
from "../../components/ui/GlowButton";

import GlassCard
from "../../components/ui/GlassCard";

import InputField
from "../../components/ui/InputField";

export default function Login() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function login() {

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (
        email ===
        "host@gmail.com"
      ) {

        navigate("/host");
      }

      else if (
        email ===
        "teamA@gmail.com"
      ) {async function login() {

  try {

    const userCredential =

      await signInWithEmailAndPassword(

        auth,

        email,

        password
      );

    const loggedInEmail =

      userCredential.user.email;

    console.log(loggedInEmail);

    if (

      loggedInEmail ===
      "host@gmail.com"
    ) {

      navigate("/host");
    }

    else if (

      loggedInEmail ===
      "teamA@gmail.com"
    ) {

      navigate("/team/teamA");
    }

    else if (

      loggedInEmail ===
      "teamB@gmail.com"
    ) {

      navigate("/team/teamB");
    }

    else if (

      loggedInEmail ===
      "teamC@gmail.com"
    ) {

      navigate("/team/teamC");
    }

    else {

      alert(
        "Unauthorized user"
      );

      navigate("/");
    }

  }

  catch (err) {

    alert(err.message);
  }
}

        navigate("/team/teamA");
      }

      else if (
        email ===
        "teamB@gmail.com"
      ) {

        navigate("/team/teamB");
      }

      else {

        navigate("/team/teamC");
      }

    } catch (err) {

      alert(err.message);
    }
  }

  return (

    <div
      className="

      relative

      min-h-screen

      flex
      items-center
      justify-center

      px-6

      overflow-hidden
    "

    >

      <SpotlightBackground />

      <motion.div

        initial={{
          opacity: 0,
          scale: 0.8,
          y: 50
        }}

        animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }}

        transition={{
          duration: 0.7
        }}

        className="w-full
        max-w-md"

      >

        <GlassCard
          className="p-10">

          <div
            className="mb-10">

            <AnimatedLogo />

          </div>

          <div
            className="space-y-5">

            <InputField

              type="email"

              placeholder="Enter email"

              value={email}

              onChange={e =>
                setEmail(
                  e.target.value
                )
              }

            />

            <InputField

              type="password"

              placeholder="Enter password"

              value={password}

              onChange={e =>
                setPassword(
                  e.target.value
                )
              }

            />

            <GlowButton

              onClick={login}

              className="

              w-full

              h-14

              text-lg

              mt-5
            "

            >

              Enter Arena

            </GlowButton>

          </div>

        </GlassCard>

      </motion.div>

    </div>
  );
}