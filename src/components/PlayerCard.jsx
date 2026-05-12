import {
  motion
}
from "framer-motion";

import Card
from "./ui/Card";

import Badge
from "./ui/Badge";

export default function PlayerCard({

  player,

  currentBid

}) {

  if (!player)
    return null;

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 40
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

    >

      <Card
        className="overflow-hidden">

        <div
          className="p-8">

          <div
            className="

            flex
            flex-col
            lg:flex-row
            gap-10
            items-center
          "

          >

            <img

              src={
                player.image ||

                'https://placehold.co/300x300'
              }

              alt={player.name}

              className="

              w-72
              h-72

              rounded-3xl

              object-cover

              border
              border-white/10
            "

            />

            <div className="flex-1">

              <div
                className="
                flex
                gap-3
                mb-5
              ">

                <Badge>

                  LIVE

                </Badge>

                <Badge
                  className="bg-green-500">

                  ₹ {currentBid}

                </Badge>

              </div>

              <h1
                className="

                text-6xl
                font-bold
                mb-6
              "

              >

                {player.name}

              </h1>

              <div
                className="

                grid
                grid-cols-2
                lg:grid-cols-3
                gap-5
              "

              >

                <StatBox
                  label="Runs"
                  value={
                    player.runs || 0
                  }
                />

                <StatBox
                  label="Strike Rate"
                  value={
                    player.strikeRate || 0
                  }
                />

                <StatBox
                  label="Wickets"
                  value={
                    player.wickets || 0
                  }
                />

                <StatBox
                  label="Average"
                  value={
                    player.average || 0
                  }
                />

                <StatBox
                  label="Economy"
                  value={
                    player.economy || 0
                  }
                />

                <StatBox
                  label="Sixes"
                  value={
                    player.sixes || 0
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </Card>

    </motion.div>
  );
}

function StatBox({

  label,

  value

}) {

  return (

    <div
      className="

      bg-white/5

      border
      border-white/10

      rounded-2xl

      p-5

      text-center
    "

    >

      <p
        className="

        text-slate-300
        text-sm
      "

      >

        {label}

      </p>

      <h2
        className="

        text-3xl
        font-bold

        mt-2
      "

      >

        {value}

      </h2>

    </div>
  );
}