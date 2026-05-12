import {
  ref,
  update,
  onValue
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

import {
  useEffect,
  useState
}
from "react";

export default function Team() {

  const auction =
    useAuction();

  const { teamId } =
    useParams();

  const timeLeft =
    useTimer(
      auction?.timerEnd
    );

  const [team, setTeam] =
    useState(null);

  useEffect(() => {

    const teamRef =
      ref(
        db,
        `teams/${teamId}`
      );

    onValue(
      teamRef,
      snapshot => {

        setTeam(
          snapshot.val()
        );
      }
    );

  }, []);

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
        "Already highest bidder"
      );

      return;
    }

    const newBid =
      auction.currentBid +
      amount;

    if (
      newBid > team.purse
    ) {

      alert(
        "Insufficient purse"
      );

      return;
    }

    await update(
      ref(db, "auction"),
      {

        currentBid:
          newBid,

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
        {team?.name}
      </h1>

      <h2>
        Purse:
        {team?.purse}
      </h2>

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

      <div
        style={{
          marginTop: "40px"
        }}>

        <h2>
          Squad
        </h2>

        {team?.players?.map(
          (player, index) => (

            <div key={index}>

              {player.name}
              -
              ₹{player.price}

            </div>
          )
        )}

      </div>

    </div>
  );
}