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

import SoldModal
from "../../components/SoldModal";

export default function Team() {

  const auction =
    useAuction();

  const { teamId } =
    useParams();

  const timeLeft =
    useTimer(

      auction?.timerEnd,

      auction?.paused
    );

  const [team, setTeam] =
    useState(null);

  const [
    showSoldModal,

    setShowSoldModal

  ] = useState(false);

  const [
    soldData,

    setSoldData

  ] = useState(null);

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

  useEffect(() => {

    if (!auction)
      return;

    if (
      auction.status ===
      "ENDED"
    ) {

      setSoldData({

        sold:
          !!auction.highestBidder,

        player:
          auction.currentPlayer
            ?.name,

        team:
          auction.highestBidder,

        price:
          auction.currentBid
      });

      setShowSoldModal(true);

      setTimeout(() => {

        setShowSoldModal(false);

      }, 5000);
    }

  }, [auction]);

  async function placeBid(
    amount
  ) {

    if (
      !auction?.currentPlayer
    )
      return;

    if (
      auction.highestBidder ===
      team?.name
    ) {

      alert(
        "You already have highest bid"
      );

      return;
    }

    if (auction?.paused)
      return;

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

              {team?.name}

            </h1>

            <p
              className="

              text-slate-400

              text-sm
            "

            >

              Live Team Dashboard

            </p>

          </div>

          <Card
            className="

            px-6
            py-4
          "

          >

            <p
              className="

              text-slate-400
              text-sm
            "

            >

              Remaining Purse

            </p>

            <h1
              className="

              text-3xl
              font-black

              text-green-400
            "

            >

              ₹ {team?.purse || 0}

            </h1>

          </Card>

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

                {/* BID BUTTONS */}

                <Card
                  className="

                  flex-1

                  p-6

                  flex
                  flex-col

                  justify-center
                "

                >

                  <div
                    className="

                    grid
                    grid-cols-3

                    gap-4
                  "

                  >

                    <Button

                      disabled={

                        auction.highestBidder ===
                        team?.name ||

                        auction?.paused
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
                        team?.name ||

                        auction?.paused
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
                        team?.name ||

                        auction?.paused
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