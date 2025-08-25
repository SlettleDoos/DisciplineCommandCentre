import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Dashboard({
  currentStreak,
  longestStreak,
  incrementStreak,
  resetStreak,
  goals,
}) {
  // Background gallery
  const [bgImages, setBgImages] = useState([
    "/images/bg1.jpg",
    "/images/bg2.jpg",
    "/images/bg3.jpg",
  ]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const bgInterval = useRef(null);

  const nextBg = () =>
    setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
  const prevBg = () =>
    setCurrentBgIndex((prev) =>
      prev === 0 ? bgImages.length - 1 : prev - 1
    );

  useEffect(() => {
    bgInterval.current = setInterval(nextBg, 10000); // auto rotate every 10s
    return () => clearInterval(bgInterval.current);
  }, [bgImages]);

  // Editable affirmations
  const [affirmations, setAffirmations] = useState([
    "You are unstoppable.",
    "Discipline builds freedom.",
    "Every day is growth.",
  ]);
  const [currentAffIndex, setCurrentAffIndex] = useState(0);
  const [newAff, setNewAff] = useState("");

  const nextAff = () =>
    setCurrentAffIndex((prev) => (prev + 1) % affirmations.length);
  const prevAff = () =>
    setCurrentAffIndex((prev) =>
      prev === 0 ? affirmations.length - 1 : prev - 1
    );

  useEffect(() => {
    const affInterval = setInterval(nextAff, 7000); // rotate every 7s
    return () => clearInterval(affInterval);
  }, [affirmations]);

  const addAffirmation = () => {
    if (newAff.trim() !== "") {
      setAffirmations((prev) => [...prev, newAff.trim()]);
      setNewAff("");
    }
  };

  const deleteAffirmation = (index) =>
    setAffirmations((prev) => prev.filter((_, i) => i !== index));

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-start p-6 transition-all duration-500"
      style={{
        backgroundImage: `url(${bgImages[currentBgIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-black bg-opacity-50 p-6 rounded-xl w-full max-w-4xl flex flex-col items-center space-y-6">
        {/* Streak */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-2">🔥 Current Streak: {currentStreak} days</h1>
          <p className="text-gray-300 mb-4">Longest Streak: {longestStreak} days</p>
          <div className="flex gap-3">
            <button
              onClick={incrementStreak}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              +1 Day
            </button>
            <button
              onClick={resetStreak}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Affirmations */}
        <div className="w-full flex flex-col items-center bg-gray-900 bg-opacity-60 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Affirmation</h2>
          <p className="text-center text-lg mb-2">{affirmations[currentAffIndex]}</p>
          <div className="flex gap-2 mb-2">
            <button onClick={prevAff} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              Prev
            </button>
            <button onClick={nextAff} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              Next
            </button>
          </div>
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={newAff}
              onChange={(e) => setNewAff(e.target.value)}
              placeholder="Add new affirmation"
              className="flex-1 px-2 py-1 rounded text-black"
            />
            <button
              onClick={addAffirmation}
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {affirmations.map((aff, i) => (
              <div
                key={i}
                className="bg-gray-700 px-2 py-1 rounded flex items-center gap-1 text-sm"
              >
                {aff}
                <button onClick={() => deleteAffirmation(i)} className="text-red-400 hover:text-red-600">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Background Controls */}
        <div className="flex gap-2">
          <button
            onClick={prevBg}
            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Prev
          </button>
          <button
            onClick={nextBg}
            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 flex items-center gap-1"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
