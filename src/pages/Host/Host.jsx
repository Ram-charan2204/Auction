import {
  ref,
  update,
  get
}
from "firebase/database";

import {
  useEffect,
  useState
}
from "react";

import SoldModal
from "../../components/SoldModal";

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

      auction?.timerEnd,

      auction?.paused
    );

  const [
    showSoldModal,

    setShowSoldModal

  ] = useState(false);

  const [
    soldData,

    setSoldData

  ] = useState(null);

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

        remainingTime: 10000,

        status: "LIVE"
      }
    );
  }

  async function togglePause() {

    if (!auction)
      return;

    if (!auction.timerEnd)
      return;

    if (!auction.paused) {

      const remaining =

        auction.timerEnd -
        Date.now();

      await update(
        ref(db, "auction"),
        {

          paused: true,

          remainingTime:
            remaining
        }
      );

    } else {

      await update(
        ref(db, "auction"),
        {

          paused: false,

          timerEnd:

            Date.now() +

            auction.remainingTime
        }
      );
    }
  }

  useEffect(() => {

    if (!auction)
      return;

    if (!auction.timerEnd)
      return;

    const interval =
      setInterval(async () => {

        if (auction.paused)
          return;

        const remaining =

          auction.timerEnd -
          Date.now();

        if (remaining <= 0) {

          clearInterval(interval);

          const sold =
            auction.highestBidder;

          if (
            auction.status ===
            "ENDED"
          ) return;

          if (sold) {

            const teamsRef =
              ref(
                db,
                "teams"
              );

            const teamsSnap =
              await get(
                teamsRef
              );

            const teams =
              teamsSnap.val();

            let teamKey =
              null;

            Object.keys(
              teams
            ).forEach(key => {

              if (
                teams[key].name ===
                auction.highestBidder
              ) {

                teamKey = key;
              }
            });

            if (teamKey) {

              const team =
                teams[teamKey];

              const updatedPlayers =

                team.players

                  ? [

                      ...team.players,

                      {

                        name:
                          auction.currentPlayer.name,

                        price:
                          auction.currentBid
                      }
                    ]

                  : [

                      {

                        name:
                          auction.currentPlayer.name,

                        price:
                          auction.currentBid
                      }
                    ];

              await update(

                ref(
                  db,
                  `teams/${teamKey}`
                ),

                {

                  purse:

                    team.purse -

                    auction.currentBid,

                  players:
                    updatedPlayers
                }
              );
            }
          }

          setSoldData({

            sold:
              !!sold,

            player:
              auction.currentPlayer
                ?.name,

            team:
              auction.highestBidder,

            price:
              auction.currentBid
          });

          setShowSoldModal(true);

          await update(
            ref(db, "auction"),
            {

              status: "ENDED"
            }
          );

          setTimeout(async () => {

            setShowSoldModal(false);

            await update(
              ref(db, "auction"),
              {

                currentPlayer:
                  null,

                currentBid: 0,

                highestBidder: "",

                timerEnd: null,

                paused: false,

                remainingTime: 0,

                status: "IDLE"
              }
            );

          }, 5000);
        }

      }, 500);

    return () =>
      clearInterval(interval);

  }, [auction]);

  return (

    <>

      <div
        className="

        h-screen

        overflow-hidden

        max-w-[1800px]

        mx-auto

        p-4
      "

      >

        {/* HEADER */}

        <div
          className="

          h-[70px]

          flex
          justify-between
          items-center

          mb-4
        "

        >

          <div>

            <h1
              className="

              text-4xl
              font-black
            "

            >

              Bit Wars

            </h1>

            <p
              className="

              text-slate-400

              text-sm
            "

            >

              Live Auction Control Center

            </p>

          </div>

          <div
            className="flex gap-3">

            <Button

              onClick={startPlayer}

              className="

              h-12

              px-8

              text-lg
            "

            >

              Start Auction

            </Button>

            <Button

              onClick={togglePause}

              className="

              h-12

              px-8

              text-lg

              bg-yellow-500

              hover:bg-yellow-600
            "

            >

              {

                auction?.paused

                  ? "Resume"

                  : "Pause"
              }

            </Button>

          </div>

        </div>

        {

          auction?.currentPlayer && (

            <div
              className="

              grid

              grid-cols-1

              xl:grid-cols-2

              gap-4

              h-[calc(100vh-100px)]
            "

            >

              {/* LEFT */}

              <div
                className="

                h-full
              "

              >

                <PlayerCard

                  player={
                    auction.currentPlayer
                  }

                  currentBid={
                    auction.currentBid
                  }

                  compact={true}

                />

              </div>

              {/* RIGHT */}

              <div
                className="

                h-full

                flex
                flex-col

                gap-4
              "

              >

                {/* TIMER */}

                <Card
                  className="

                  flex-1

                  p-6

                  flex
                  flex-col

                  items-center
                  justify-center
                "

                >

                  <h2
                    className="

                    text-2xl
                    font-bold

                    mb-4
                  "

                  >

                    Auction Timer

                  </h2>

                  <div
                    className="relative">

                    <TimerRing
                      timeLeft={timeLeft}
                    />

                    {

                      auction?.paused && (

                        <div
                          className="

                          absolute
                          inset-0

                          flex
                          items-center
                          justify-center

                          bg-black/50

                          rounded-full
                        "

                        >

                          <h1
                            className="

                            text-2xl
                            font-black

                            text-yellow-400
                          "

                          >

                            PAUSED

                          </h1>

                        </div>
                      )
                    }

                  </div>

                </Card>

                {/* BID */}

                <Card
                  className="

                  flex-1

                  p-6

                  flex
                  flex-col

                  justify-center
                "

                >

                  <h2
                    className="

                    text-2xl
                    font-bold

                    mb-4
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

                {/* HIGHEST BIDDER */}

                <Card
                  className="

                  flex-1

                  p-6

                  flex
                  flex-col

                  justify-center
                "

                >

                  <h2
                    className="

                    text-2xl
                    font-bold

                    mb-4
                  "

                  >

                    Highest Bidder

                  </h2>

                  <p
                    className="

                    text-3xl

                    text-blue-400

                    font-bold
                  "

                  >

                    {

                      auction.highestBidder ||

                      "Waiting..."
                    }

                  </p>

                </Card>

              </div>

            </div>
          )
        }

      </div>

      <SoldModal

        open={showSoldModal}

        sold={soldData?.sold}

        player={soldData?.player}

        team={soldData?.team}

        price={soldData?.price}

      />

    </>
  );
}