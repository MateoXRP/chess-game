// src/components/Leaderboard.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const q = query(collection(db, "chess-leaderboard"), orderBy("wins", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-gray-700 p-4 rounded mt-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2 text-white">🏆 Chess Leaderboard</h2>
      <ul className="text-white text-sm space-y-1">
        {entries.map((entry, index) => (
          <li key={entry.id} className="flex justify-between">
            <span>
              {index + 1}. {entry.name}
            </span>
            <span>
              {entry.wins}W / {entry.losses}L
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
