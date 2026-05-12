import {
  useEffect,
  useState
}
from "react";

import {
  ref,
  onValue
}
from "firebase/database";

import {
  db
}
from "../../firebase/firebase";

import useAuction
from "../../hooks/useAuction";

import ViewerHero
from "../../components/ViewerHero";

import ActivityFeed
from "../../components/ActivityFeed";

import AnalyticsPanel
from "../../components/AnalyticsPanel";

export default function Viewer() {

  const auction =
    useAuction();

  const [teams, setTeams] =
    useState({});

  const [history, setHistory] =
    useState([]);

  useEffect(() => {

    const teamsRef =
      ref(db, "teams");

    const historyRef =
      ref(
        db,
        "history"
      );

    onValue(
      teamsRef,
      snapshot => {

        setTeams(
          snapshot.val() || {}
        );
      }
    );

    onValue(
      historyRef,
      snapshot => {

        setHistory(
          snapshot.val() || []
        );
      }
    );

  }, []);

  return (

    <div
      className="

      min-h-screen

      max-w-[1800px]

      mx-auto

      p-8
    "

    >

      <div
        className="mb-10">

        <h1
          className="

          text-7xl
          font-black
        "

        >

          Bit Wars Live

        </h1>

        <p
          className="

          text-slate-300

          mt-3

          text-2xl
        "

        >

          Live Auction Broadcast

        </p>

      </div>

      <div
        className="space-y-8">

        <ViewerHero

          player={
            auction?.currentPlayer
          }

          currentBid={
            auction?.currentBid
          }

          highestBidder={
            auction?.highestBidder
          }

        />

        <div
          className="

          grid

          grid-cols-1

          xl:grid-cols-3

          gap-8
        "

        >

          <div
            className="xl:col-span-2">

            <AnalyticsPanel
              teams={teams}
            />

          </div>

          <ActivityFeed
            history={history}
          />

        </div>

      </div>

    </div>
  );
}