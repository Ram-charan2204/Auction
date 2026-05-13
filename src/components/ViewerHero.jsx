import {
  motion
}
from "framer-motion";

export default function ViewerHero({

  player,

  currentBid,

  highestBidder

}) {

  if (!player)
    return null;

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 30
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      className="

      relative

      overflow-hidden

      rounded-[40px]

      border
      border-white/10

      bg-white/10

      backdrop-blur-xl

      p-10
    "

    >

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
            "/players/default.jpg" ||

            'https://placehold.co/400'
          }

          alt={player.name}

          className="

          w-80
          h-80

          rounded-[40px]

          object-cover
        "

        />

        <div className="flex-1">

          <motion.h1

            animate={{
              textShadow: [

                '0px 0px 20px #3b82f6',

                '0px 0px 40px #8b5cf6',

                '0px 0px 20px #3b82f6'
              ]
            }}

            transition={{
              repeat: Infinity,
              duration: 3
            }}

            className="

            text-7xl
            font-black
          "

          >

            {player.name}

          </motion.h1>

          <div
            className="

            mt-8

            space-y-4
          "

          >

            <h2
              className="

              text-5xl
              font-black

              text-green-400
            "

            >

              ₹ {currentBid}

            </h2>

            <h3
              className="

              text-3xl

              text-blue-400
            "

            >

              {

                highestBidder ||

                'No bids yet'
              }

            </h3>

          </div>

        </div>

      </div>

    </motion.div>
  );
}