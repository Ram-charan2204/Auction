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

import PlayerCard
from "../../components/PlayerCard";

import TimerRing
from "../../components/TimerRing";

import AnimatedBid
from "../../components/AnimatedBid";

import Button
from "../../components/ui/Button";

import Card
from "../../components/ui/Card";

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

  return (

    <div
      className="

      min-h-screen

      max-w-7xl
      mx-auto

      p-8
    "

    >

      <div
        className="

        flex
        flex-col
        lg:flex-row

        justify-between
        items-center

        gap-6

        mb-10
      "

      >

        <div>

          <h1
            className="

            text-6xl
            font-bold
          "

          >

            Bit Wars

          </h1>

          <p
            className="

            text-slate-300
            mt-3
            text-lg
          "

          >

            Live Auction Control Center

          </p>

        </div>

        <Button

          onClick={startPlayer}

          className="

          text-lg
          h-14
          px-10
        "

        >

          Start Auction

        </Button>

      </div>

      {

        auction?.currentPlayer && (

          <div
            className="space-y-8">

            <PlayerCard

              player={
                auction.currentPlayer
              }

              currentBid={
                auction.currentBid
              }

            />

            <div
              className="

              grid
              grid-cols-1
              lg:grid-cols-2

              gap-8
            "

            >

              <Card
                className="p-10">

                <h2
                  className="

                  text-3xl
                  font-bold
                  mb-8
                "

                >

                  Current Bid

                </h2>

                <AnimatedBid
                  bid={
                    auction.currentBid
                  }
                />

              </Card>

              <Card
                className="

                p-10

                flex
                flex-col
                items-center
                justify-center
              "

              >

                <h2
                  className="

                  text-3xl
                  font-bold
                  mb-8
                "

                >

                  Auction Timer

                </h2>

                <TimerRing
                  timeLeft={timeLeft}
                />

              </Card>

            </div>

            <Card
              className="p-8">

              <h2
                className="

                text-3xl
                font-bold
                mb-5
              "

              >

                Highest Bidder

              </h2>

              <p
                className="

                text-4xl
                text-blue-400
                font-semibold
              "

              >

                {

                  auction.highestBidder ||

                  "Waiting for bids..."
                }

              </p>

            </Card>

          </div>
        )
      }

    </div>
  );
}