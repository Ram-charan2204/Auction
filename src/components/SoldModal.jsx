import {
  motion,
  AnimatePresence
}
from "framer-motion";

export default function SoldModal({

  open,

  sold,

  player,

  team,

  price,

  onClose

}) {

  return (

    <AnimatePresence>

      {

        open && (

          <motion.div

            initial={{
              opacity: 0
            }}

            animate={{
              opacity: 1
            }}

            exit={{
              opacity: 0
            }}

            className="

            fixed
            inset-0

            z-[100]

            bg-black/70

            backdrop-blur-md

            flex
            items-center
            justify-center
          "

          >

            <motion.div

              initial={{
                scale: 0.5,
                opacity: 0,
                y: 100
              }}

              animate={{
                scale: 1,
                opacity: 1,
                y: 0
              }}

              exit={{
                scale: 0.5,
                opacity: 0
              }}

              transition={{
                type: "spring",
                damping: 10
              }}

              className="

              relative

              overflow-hidden

              w-[90%]
              max-w-3xl

              rounded-[40px]

              border
              border-white/10

              bg-gradient-to-br

              from-slate-900
              to-indigo-950

              p-12

              text-center

              shadow-2xl
            "

            >

              {

                sold

                  ? (

                    <>

                      <motion.div

                        animate={{
                          rotate: [

                            0,

                            -20,

                            20,

                            -10,

                            10,

                            0
                          ]
                        }}

                        transition={{
                          duration: 1,
                          repeat: Infinity
                        }}

                        className="

                        text-[120px]

                        mb-6
                      "

                      >

                        🔨

                      </motion.div>

                      <motion.h1

                        initial={{
                          scale: 0.5
                        }}

                        animate={{
                          scale: 1
                        }}

                        transition={{
                          delay: 0.2
                        }}

                        className="

                        text-8xl

                        font-black

                        text-green-400
                      "

                      >

                        SOLD

                      </motion.h1>

                      <h2
                        className="

                        text-5xl

                        font-bold

                        mt-8
                      "

                      >

                        {player}

                      </h2>

                      <p
                        className="

                        text-3xl

                        text-blue-400

                        mt-5
                      "

                      >

                        Sold to

                        {" "}

                        <span
                          className="font-black">

                          {team}

                        </span>

                      </p>

                      <motion.h2

                        animate={{
                          scale: [1, 1.08, 1]
                        }}

                        transition={{
                          repeat: Infinity,
                          duration: 1
                        }}

                        className="

                        text-7xl

                        font-black

                        text-yellow-400

                        mt-8
                      "

                      >

                        ₹ {price}

                      </motion.h2>

                    </>
                  )

                  : (

                    <>

                      <motion.div

                        animate={{
                          rotate: [

                            0,

                            -20,

                            20,

                            -10,

                            10,

                            0
                          ]
                        }}

                        transition={{
                          duration: 1,
                          repeat: Infinity
                        }}

                        className="

                        text-[120px]

                        mb-6
                      "

                      >

                        🪓

                      </motion.div>

                      <motion.h1

                        initial={{
                          scale: 0.5
                        }}

                        animate={{
                          scale: 1
                        }}

                        transition={{
                          delay: 0.2
                        }}

                        className="

                        text-8xl

                        font-black

                        text-red-400
                      "

                      >

                        UNSOLD

                      </motion.h1>

                      <h2
                        className="

                        text-5xl

                        font-bold

                        mt-8
                      "

                      >

                        {player}

                      </h2>

                      <p
                        className="

                        text-3xl

                        text-slate-300

                        mt-6
                      "

                      >

                        No team placed a winning bid

                      </p>

                    </>
                  )
              }

            </motion.div>

          </motion.div>
        )
      }

    </AnimatePresence>
  );
}