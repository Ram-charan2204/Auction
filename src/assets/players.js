export const players = [
  {
    id: 1,
    name: "Virat Kohli",
    role: "Batsman",
    basePrice: 1000,
    image: "/players/virat.jpg", // Ensure images exist in public/players/
    batting: { runs: 550, sr: 145, avg: 42, sixes: 25, fours: 40 },
    bowling: { overs: 0, eco: 0, wickets: 0, maidens: 0 }
  },
  {
    id: 2,
    name: "Hardik Pandya",
    role: "All-Rounder",
    basePrice: 1000,
    image: "/players/hardik.jpg",
    batting: { runs: 320, sr: 160, avg: 30, sixes: 30, fours: 12 },
    bowling: { overs: 24, eco: 8.2, wickets: 12, maidens: 1 }
  },
  {
    id: 3,
    name: "Jasprit Bumrah",
    role: "Bowler",
    basePrice: 1000,
    image: "/players/bumrah.jpg",
    batting: { runs: 45, sr: 90, avg: 8, sixes: 2, fours: 4 },
    bowling: { overs: 40, eco: 6.1, wickets: 22, maidens: 5 }
  },
  {
    id: 4,
    name: "Rohit Sharma",
    role: "Batsman",
    basePrice: 1000,
    image: "/players/rohit.jpg",
    batting: { runs: 480, sr: 138, avg: 38, sixes: 22, fours: 35 },
    bowling: { overs: 2, eco: 9.0, wickets: 0, maidens: 0 }
  },
  {
    id: 5,
    name: "Ravindra Jadeja",
    role: "All-Rounder",
    basePrice: 1000,
    image: "/players/jadeja.jpg",
    batting: { runs: 280, sr: 130, avg: 28, sixes: 15, fours: 20 },
    bowling: { overs: 35, eco: 7.2, wickets: 18, maidens: 3 }
  },
  {
    id: 6,
    name: "Rashid Khan",
    role: "Bowler",
    basePrice: 1000,
    image: "/players/rashid.jpg",
    batting: { runs: 120, sr: 155, avg: 15, sixes: 10, fours: 5 },
    bowling: { overs: 40, eco: 6.4, wickets: 20, maidens: 2 }
  }
  // You can add more players following this exact structure
];