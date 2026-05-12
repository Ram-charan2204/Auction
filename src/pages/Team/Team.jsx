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

import {
  useEffect,
  useState
}
from "react";

import {
  useParams
}
from "react-router-dom";

import useAuction
from "../../hooks/useAuction";

import useTimer
from "../../hooks/useTimer";

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

    const unsubscribe =
      onValue(
        teamRef,
        snapshot => {

          setTeam(
            snapshot.val()
          );
        }
      );

    return () =>
      unsubscribe();

  }, [teamId]);

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
          team.name,

        timerEnd:
          Date.now() + 10000
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

            {team?.name}

          </h1>

          <p
            className="

            text-slate-300
            mt-3
            text-lg
          "

          >

            Live Team Auction Panel

          </p>

        </div>

        <Card
          className="

          px-8
          py-5
        "

        >

          <h2
            className="

            text-xl
            text-slate-300
          "

          >

            Purse

          </h2>

          <h1
            className="

            text-5xl
            font-bold
            text-green-400
            mt-2
          "

          >

            ₹ {team?.purse || 0}

          </h1>

        </Card>

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

            <div
              className="

              grid
              grid-cols-1
              md:grid-cols-3

              gap-5
            "

            >

              <Button

                disabled={
                  auction.highestBidder ===
                  team?.name
                }

                onClick={() =>
                  placeBid(10)
                }

                className="

                h-20

                text-3xl

                bg-blue-500
                hover:bg-blue-600
              "

              >

                +10

              </Button>

              <Button

                disabled={
                  auction.highestBidder ===
                  team?.name
                }

                onClick={() =>
                  placeBid(50)
                }

                className="

                h-20

                text-3xl

                bg-purple-500
                hover:bg-purple-600
              "

              >

                +50

              </Button>

              <Button

                disabled={
                  auction.highestBidder ===
                  team?.name
                }

                onClick={() =>
                  placeBid(100)
                }

                className="

                h-20

                text-3xl

                bg-green-500
                hover:bg-green-600
              "

              >

                +100

              </Button>

            </div>

            <Card
              className="p-8">

              <h2
                className="

                text-3xl
                font-bold
                mb-6
              "

              >

                Squad

              </h2>

              {

                team?.players?.length >

                0 ? (

                  <div
                    className="

                    grid
                    grid-cols-1
                    md:grid-cols-2
                    lg:grid-cols-3

                    gap-5
                  "

                  >

                    {

                      team.players.map(
                        (
                          player,
                          index
                        ) => (

                          <div

                            key={index}

                            className="

                            bg-white/5

                            border
                            border-white/10

                            rounded-2xl

                            p-5
                          "

                          >

                            <h2
                              className="

                              text-2xl
                              font-bold
                            "

                            >

                              {player.name}

                            </h2>

                            <p
                              className="

                              text-green-400
                              mt-3
                              text-xl
                            "

                            >

                              ₹ {player.price}

                            </p>

                          </div>
                        )
                      )
                    }

                  </div>

                ) : (

                  <p
                    className="

                    text-slate-400
                    text-xl
                  "

                  >

                    No players bought yet

                  </p>
                )
              }

            </Card>

          </div>
        )
      }

    </div>
  );
}