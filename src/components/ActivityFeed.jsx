import {
  motion
}
from "framer-motion";

import Card
from "./ui/Card";

export default function ActivityFeed({

  history

}) {

  return (

    <Card
      className="p-6
      h-full">

      <h1
        className="

        text-3xl
        font-bold

        mb-6
      "

      >

        Live Feed

      </h1>

      <div
        className="

        space-y-4

        max-h-[500px]

        overflow-y-auto
      "

      >

        {

          history?.length > 0

            ? (

              history
                .slice()
                .reverse()
                .map(
                  (
                    item,
                    index
                  ) => (

                    <motion.div

                      key={index}

                      initial={{
                        opacity: 0,
                        x: 30
                      }}

                      animate={{
                        opacity: 1,
                        x: 0
                      }}

                      className="

                      bg-white/5

                      border
                      border-white/10

                      rounded-2xl

                      p-4
                    "

                    >

                      <p
                        className="

                        text-lg
                      "

                      >

                        {

                          item.player
                        }

                      </p>

                      <p
                        className="

                        text-blue-400

                        mt-2
                      "

                      >

                        {

                          item.team
                        }

                      </p>

                      <p
                        className="

                        text-green-400

                        mt-1
                      "

                      >

                        ₹ {item.price}

                      </p>

                    </motion.div>
                  )
                )
            )

            : (

              <p
                className="

                text-slate-400
              "

              >

                No auction history yet

              </p>
            )
        }

      </div>

    </Card>
  );
}