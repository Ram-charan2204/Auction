import Card
from "./ui/Card";

export default function AnalyticsPanel({

  teams

}) {

  const sortedTeams =

    Object.values(
      teams || {}
    ).sort(
      (a, b) =>

        (
          b.players?.length || 0
        ) -

        (
          a.players?.length || 0
        )
    );

  return (

    <Card
      className="p-6">

      <h1
        className="

        text-3xl
        font-bold

        mb-8
      "

      >

        Team Analytics

      </h1>

      <div
        className="space-y-5">

        {

          sortedTeams.map(
            (
              team,
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

                <div
                  className="

                  flex
                  justify-between

                  items-center
                "

                >

                  <h2
                    className="

                    text-2xl
                    font-bold
                  "

                  >

                    {team.name}

                  </h2>

                  <h2
                    className="

                    text-green-400

                    text-2xl
                  "

                  >

                    ₹ {team.purse}

                  </h2>

                </div>

                <div
                  className="

                  mt-4

                  flex
                  justify-between
                "

                >

                  <p
                    className="

                    text-slate-300
                  "

                  >

                    Squad Size

                  </p>

                  <p
                    className="

                    text-blue-400
                    font-bold
                  "

                  >

                    {

                      team.players
                        ?.length || 0
                    }

                  </p>

                </div>

              </div>
            )
          )
        }

      </div>

    </Card>
  );
}