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
  useParams
}
from "react-router-dom";

export default function Team() {

  const auction =
    useAuction();

  const { teamId } =
    useParams();

  const timeLeft =
    useTimer(
      auction?.timerEnd
    );

  async function placeBid(
    amount
  ) {

    if (
      !auction?.currentPlayer
    )
      return;

    if (
      auction.highestBidder ===
      teamId
    ) {

      alert(
        "You already have highest bid"
      );

      return;
    }

    await update(
      ref(db, "auction"),
      {

        currentBid:
          auction.currentBid +
          amount,

        highestBidder:
          teamId,

        timerEnd:
          Date.now() + 10000
      }
    );
  }

  return (

    <div
      style={{
        padding: "40px"
      }}>

      <h1>
        {teamId}
      </h1>

      {auction?.currentPlayer && (

        <div>

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

          <button
            disabled={
              auction.highestBidder ===
              teamId
            }
            onClick={() =>
              placeBid(10)
            }>

            +10

          </button>

          <button
            disabled={
              auction.highestBidder ===
              teamId
            }
            onClick={() =>
              placeBid(50)
            }>

            +50

          </button>

          <button
            disabled={
              auction.highestBidder ===
              teamId
            }
            onClick={() =>
              placeBid(100)
            }>

            +100

          </button>

        </div>
      )}

    </div>
  );
}