import {
  useEffect,
  useState
}
from "react";

import {
  db
}
from "../firebase/firebase";

import {
  ref,
  onValue
}
from "firebase/database";

export default function useAuction() {

  const [auction, setAuction] =
    useState(null);

  useEffect(() => {

    const auctionRef =
      ref(db, "auction");

    const unsubscribe =
      onValue(
        auctionRef,
        snapshot => {

          setAuction(
            snapshot.val()
          );
        }
      );

    return () => unsubscribe();

  }, []);

  return auction;
}