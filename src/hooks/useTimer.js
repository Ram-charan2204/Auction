import {
  useEffect,
  useState
}
from "react";

export default function useTimer(

  timerEnd,

  paused

) {

  const [timeLeft, setTimeLeft] =
    useState(0);

  useEffect(() => {

    if (!timerEnd)
      return;

    const interval =
      setInterval(() => {

        if (paused)
          return;

        const seconds =

          Math.max(

            0,

            Math.ceil(
              (
                timerEnd -
                Date.now()
              ) / 1000
            )
          );

        setTimeLeft(seconds);

      }, 200);

    return () =>
      clearInterval(interval);

  }, [

    timerEnd,

    paused
  ]);

  return timeLeft;
}