import Card
from "./ui/Card";

export default function PlayerCard({

  player,

  compact = false

}) {

  if (!player)
    return null;

  return (

    <Card
      className="

      h-full

      p-6

      overflow-hidden
    "

    >

      <div
        className="

        flex

        flex-col
        lg:flex-row

        gap-6

        h-full
      "

      >

        {/* IMAGE */}

        <div
          className="

          flex
          justify-center
          items-center
        "

        >

          <img

            src="/players/default.jpg"

            alt={player.name}

            className={`

            object-cover

            rounded-3xl

            border
            border-white/10

            ${

              compact

                ? "w-52 h-52"

                : "w-72 h-72"
            }
          `}

          />

        </div>

        {/* DETAILS */}

        <div
          className="

          flex-1

          flex
          flex-col

          justify-center
        "

        >

          <h1
            className={`

            font-black

            mb-6

            ${

              compact

                ? "text-4xl"

                : "text-6xl"
            }
          `}

          >

            {player.name}

          </h1>

          {/* BASE PRICE */}

          <div
            className="

            mb-6

            inline-block

            bg-yellow-500/20

            border
            border-yellow-400/30

            rounded-2xl

            px-6
            py-3
          "

          >

            <p
              className="

              text-yellow-300

              text-lg
              font-bold
            "

            >

              Base Price:
              {" "}
              ₹ {player.basePrice ?? 0}

            </p>

          </div>

          {/* STATS */}

          <div
            className="

            grid

            grid-cols-2

            gap-4
          "

          >

            {/* BATTING */}

            <div
              className="

              bg-blue-500/10

              border
              border-blue-400/20

              rounded-2xl

              p-5
            "

            >

              <h2
                className="

                text-2xl
                font-bold

                mb-4

                text-blue-400
              "

              >

                Batting

              </h2>

              <div
                className="space-y-3 text-lg">

                <p>
                  Runs:
                  {" "}
                  {player?.batting?.runs ?? 0}
                </p>

                <p>
                  Strike Rate:
                  {" "}
                  {player?.batting?.sr ?? 0}
                </p>

                <p>
                  Average:
                  {" "}
                  {player?.batting?.avg ?? 0}
                </p>

                <p>
                  Sixes:
                  {" "}
                  {player?.batting?.sixes ?? 0}
                </p>

                <p>
                  Fours:
                  {" "}
                  {player?.batting?.fours ?? 0}
                </p>

              </div>

            </div>

            {/* BOWLING */}

            <div
              className="

              bg-green-500/10

              border
              border-green-400/20

              rounded-2xl

              p-5
            "

            >

              <h2
                className="

                text-2xl
                font-bold

                mb-4

                text-green-400
              "

              >

                Bowling

              </h2>

              <div
                className="space-y-3 text-lg">

                  <p>
                  Overs:
                  {" "}
                  {player?.bowling?.overs ?? 0}
                </p>
                <p>
                  Economy:
                  {" "}
                  {player?.bowling?.eco ?? 0}
                </p>

                <p>
                  Wickets:
                  {" "}
                  {player?.bowling?.wickets ?? 0}
                </p>

                <p>
                  Economy:
                  {" "}
                  {player?.bowling?.eco ?? 0}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </Card>
  );
}