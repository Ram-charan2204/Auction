import {
  ref,
  update
}
from "firebase/database";

import {
  db
}
from "../../firebase/firebase";

import useAuction
from "../../hooks/useAuction";

import useTimer
from "../../hooks/useTimer";

import {
  players
}
from "../../assets/players";

import {
  useEffect
}
from "react";

export default function Host() {

  const auction =
    useAuction();

  const timeLeft =
    useTimer(
      auction?.timerEnd
    );

  async function startPlayer() {

    const randomPlayer =

      players[
        Math.floor(
          Math.random() *
          players.length
        )
      ];

    await update(
      ref(db, "auction"),
      {

        currentPlayer:
          randomPlayer,

        currentBid:
          randomPlayer.basePrice,

        highestBidder: "",

        timerEnd:
          Date.now() + 10000,

        paused: false,

        status: "LIVE"
      }
    );
  }

  async function sellPlayer() {

    alert(
      `${auction.currentPlayer.name}
       sold to
       ${auction.highestBidder}`
    );

    await update(
      ref(db, "auction"),
      {

        currentPlayer: null,

        currentBid: 0,

        highestBidder: "",

        timerEnd: 0,

        status: "WAITING"
      }
    );
  }

  useEffect(() => {

    if (
      timeLeft === 0 &&
      auction?.currentPlayer
    ) {

      sellPlayer();
    }

  }, [timeLeft]);

  return (

    <div
      style={{
        padding: "40px"
      }}>

      <h1>
        Host Dashboard
      </h1>

      <button
        onClick={startPlayer}>

        Start Player

      </button>

      {auction?.currentPlayer && (

        <div
          style={{
            marginTop: "30px"
          }}>

          <h2>
            {
              auction.currentPlayer.name
            }
          </h2>

          <h3>
            Bid:
            {
              auction.currentBid
            }
          </h3>

          <h3>
            Highest Bidder:
            {
              auction.highestBidder ||
              "None"
            }
          </h3>

          <h1>
            ⏱️ {timeLeft}
          </h1>

        </div>
      )}

    </div>
  );
}