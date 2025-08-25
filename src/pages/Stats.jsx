import { useEffect, useState } from "react";

export default function Stats() {
  const [habits, setHabits] = useState([]);
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const h = localStorage.getItem("habits");
    const j = localStorage.getItem("journal");
    const s = localStorage.getItem("streak");

    if (h) setHabits(JSON.parse(h));
    if (j) setEntries(JSON.parse(j));
    if (s) setStreak(Number(s));
  }, []);

  const completedHabits = habits.filter((h) => h.done).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Stats</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-lg font-medium">🔥 Streak</p>
          <p className="text-2xl font-bold">{streak} days</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-lg font-medium">✅ Habits Done</p>
          <p className="text-2xl font-bold">{completedHabits}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-lg font-medium">📖 Journal Entries</p>
          <p className="text-2xl font-bold">{entries.length}</p>
        </div>
      </div>
    </div>
  );
}
