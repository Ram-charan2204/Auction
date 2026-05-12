import {
  ref,
  update,
  get,
  set
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

  async function resetAuction() {

    await set(
      ref(db, "remainingPlayers"),
      players
    );

    await update(
      ref(db, "teams/teamA"),
      {
        purse: 20000,
        players: []
      }
    );

    await update(
      ref(db, "teams/teamB"),
      {
        purse: 20000,
        players: []
      }
    );

    await update(
      ref(db, "teams/teamC"),
      {
        purse: 20000,
        players: []
      }
    );

    alert(
      "Auction Reset"
    );
  }

  async function startPlayer() {

    const snapshot =
      await get(
        ref(
          db,
          "remainingPlayers"
        )
      );

    const remaining =
      snapshot.val() || [];

    if (
      remaining.length === 0
    ) {

      alert(
        "Auction Finished"
      );

      return;
    }

    const selectedPlayer =
      remaining.pop();

    await set(
      ref(
        db,
        "remainingPlayers"
      ),
      remaining
    );

    await update(
      ref(db, "auction"),
      {

        currentPlayer:
          selectedPlayer,

        currentBid:
          selectedPlayer.basePrice,

        highestBidder: "",

        timerEnd:
          Date.now() + 10000,

        paused: false,

        status: "LIVE"
      }
    );
  }

  async function sellPlayer() {

    if (
      !auction.highestBidder
    ) {

      alert(
        "Unsold"
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

      return;
    }

    const teamRef =
      ref(
        db,
        `teams/${auction.highestBidder}`
      );

    const snapshot =
      await get(teamRef);

    const team =
      snapshot.val();

    const updatedPlayers =
      team.players || [];

    updatedPlayers.push({

      name:
        auction.currentPlayer.name,

      price:
        auction.currentBid
    });

    await update(
      teamRef,
      {

        purse:
          team.purse -
          auction.currentBid,

        players:
          updatedPlayers
      }
    );

    await set(
      ref(db, "lastSold"),
      {

        player:
          auction.currentPlayer.name,

        team:
          auction.highestBidder,

        price:
          auction.currentBid
      }
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
        onClick={resetAuction}>

        Reset Auction

      </button>

      <button
        onClick={startPlayer}
        style={{
          marginLeft: "20px"
        }}>

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