import {useState} from "react";

import {signInWithEmailAndPassword}
from "firebase/auth";

import {auth}
from "../../firebase/firebase";

import {useNavigate}
from "react-router-dom";

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
      ) {

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
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>

      <div
        style={{
          width: "400px",
          padding: "40px",
          background:
            "rgba(255,255,255,0.06)",
          borderRadius: "24px"
        }}>

        <h1
          style={{
            marginBottom: "25px"
          }}>

          Bit Wars Login

        </h1>

        <input
          type="email"
          placeholder="Email"
          onChange={e =>
            setEmail(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            borderRadius: "12px",
            border: "none"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e =>
            setPassword(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "20px",
            borderRadius: "12px",
            border: "none"
          }}
        />

        <button
          onClick={login}
          style={{
            width: "100%"
          }}>

          Login

        </button>

      </div>

    </div>
  );
}