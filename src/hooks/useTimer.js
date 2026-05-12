import {
  useEffect,
  useState
}
from "react";

export default function useTimer(
  timerEnd
) {

  const [timeLeft, setTimeLeft] =
    useState(0);

  useEffect(() => {

    if (!timerEnd)
      return;

    const interval =
      setInterval(() => {

        const remaining =

          Math.max(
            0,
            Math.floor(
              (timerEnd - Date.now())
              / 1000
            )
          );

        setTimeLeft(
          remaining
        );

      }, 200);

    return () =>
      clearInterval(
        interval
      );

  }, [timerEnd]);

  return timeLeft;
}