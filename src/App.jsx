import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Journal from "./pages/Journal";
import Goals from "./pages/Goals";
import Stats from "./pages/Stats";
import Calendar from "./pages/Calendar";
import ProgressPics from "./pages/ProgressPics";

/* ===========================
   Affirmations Modal
=========================== */
function AffirmationsModal({ show, onClose, affirmations, setAffirmations }) {
  const [input, setInput] = useState("");
  if (!show) return null;

  const handleAdd = () => {
    if (!input.trim()) return;
    setAffirmations([...affirmations, input.trim()]);
    setInput("");
  };

  const handleDelete = (index) => {
    setAffirmations(affirmations.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    const next = prompt("Edit affirmation", affirmations[index]);
    if (next !== null) {
      setAffirmations(affirmations.map((a, i) => (i === index ? next : a)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Manage Affirmations</h2>

        <ul className="space-y-2 mb-4">
          {affirmations.map((a, i) => (
            <li key={i} className="flex justify-between items-center">
              <span className="truncate">{a}</span>
              <div className="flex gap-2">
                <button
                  className="text-blue-300 hover:underline text-sm"
                  onClick={() => handleEdit(i)}
                >
                  Edit
                </button>
                <button
                  className="text-red-400 hover:underline text-sm"
                  onClick={() => handleDelete(i)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-1 rounded text-black"
            placeholder="New affirmation"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>

        <button
          className="mt-4 bg-gray-700 px-4 py-1 rounded hover:bg-gray-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ===========================
   Backgrounds Modal
   - Uploads to /api/upload
   - Saves served URLs (strings) in /api/data.backgrounds
=========================== */
function BackgroundsModal({
  show,
  onClose,
  backgrounds, // string[]
  setBackgrounds,
  timer,
  setTimer,
}) {
  const [newImage, setNewImage] = useState(null);
  const [newTimer, setNewTimer] = useState(Math.max(1, Math.floor(timer / 1000)));

  useEffect(() => {
    setNewTimer(Math.max(1, Math.floor(timer / 1000)));
  }, [timer]);

  if (!show) return null;

  const handleAdd = async () => {
    if (!newImage) return;

    const formData = new FormData();
    formData.append("file", newImage);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { fileId } = await res.json();
      const servedUrl = `/api/images/${fileId}`;

      const updated = [...backgrounds, servedUrl];
      setBackgrounds(updated);

      await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgrounds: updated }),
      });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check server logs.");
    } finally {
      setNewImage(null);
    }
  };

  const handleDelete = async (index) => {
    const updated = backgrounds.filter((_, i) => i !== index);
    setBackgrounds(updated);
    try {
      await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgrounds: updated }),
      });
    } catch (err) {
      console.error("Failed to save backgrounds:", err);
    }
  };

  const handleTimerChange = () => {
    const sec = parseInt(newTimer, 10);
    if (!Number.isNaN(sec) && sec > 0) setTimer(sec * 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Manage Backgrounds</h2>

        <ul className="space-y-2 mb-4">
          {backgrounds.map((bg, i) => (
            <li key={i} className="flex justify-between items-center">
              <span className="truncate w-64">Background {i + 1}</span>
              <button
                className="text-red-400 hover:underline text-sm"
                onClick={() => handleDelete(i)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewImage(e.target.files?.[0] || null)}
          />
          <button
            className="bg-blue-400 px-4 py-1 rounded hover:bg-blue-500"
            onClick={handleAdd}
          >
            Add Background
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <label>Slideshow Timer (sec):</label>
          <input
            type="number"
            min="1"
            value={newTimer}
            onChange={(e) => setNewTimer(e.target.value)}
            className="w-20 p-1 rounded text-black"
          />
          <button
            className="bg-green-400 px-3 py-1 rounded hover:bg-green-500"
            onClick={handleTimerChange}
          >
            Set
          </button>
        </div>

        <button
          className="mt-4 bg-gray-700 px-4 py-1 rounded hover:bg-gray-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ===========================
   Dashboard
=========================== */
function Dashboard({
  currentStreak,
  longestStreak,
  incrementStreak,
  resetStreak,
  goals,
  backgroundImages, // string[]
  setBackgroundImages,
  affirmations,
  setAffirmations,
  timer,
  setTimer,
}) {
  const [showAffirmationsModal, setShowAffirmationsModal] = useState(false);
  const [showBackgroundsModal, setShowBackgroundsModal] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);

  // Rotate background images
  useEffect(() => {
    if (!backgroundImages || backgroundImages.length === 0) return;
    const id = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, timer);
    return () => clearInterval(id);
  }, [backgroundImages, timer]);

  // Rotate affirmations every 60s
  useEffect(() => {
    if (!affirmations || affirmations.length === 0) return;
    const id = setInterval(() => {
      setCurrentAffirmationIndex((prev) => (prev + 1) % affirmations.length);
    }, 60000);
    return () => clearInterval(id);
  }, [affirmations]);

  const bgUrl =
    backgroundImages && backgroundImages.length > 0
      ? backgroundImages[bgIndex]
      : null;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6"
      style={{
        ...(bgUrl
          ? {
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "background-image 0.6s ease-in-out",
            }
          : { backgroundColor: "#111827" }),
      }}
    >
      <div className="bg-black/50 p-6 rounded-lg w-full max-w-4xl flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          ⚡ Command Center ⚡
        </h1>

        {/* Streaks */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-3xl md:text-4xl font-bold text-white">
            🔥 Current Streak: {currentStreak} days
          </p>
          <p className="text-white/80">Longest: {longestStreak} days</p>
          <div className="flex gap-2">
            <button
              onClick={incrementStreak}
              className="bg-green-400 px-4 py-1 rounded hover:bg-green-500"
            >
              + Add to Streak
            </button>
            <button
              onClick={resetStreak}
              className="bg-red-400 px-4 py-1 rounded hover:bg-red-500"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Affirmation */}
        <div className="text-center">
          <p className="text-xl text-white font-semibold mb-2">
            {affirmations[currentAffirmationIndex] ||
              "Add your first affirmation!"}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              className="bg-blue-300 px-4 py-1 rounded hover:bg-blue-400"
              onClick={() => setShowAffirmationsModal(true)}
            >
              Manage Affirmations
            </button>
            <button
              className="bg-purple-300 px-4 py-1 rounded hover:bg-purple-400"
              onClick={() => setShowBackgroundsModal(true)}
            >
              Manage Backgrounds
            </button>
          </div>
        </div>

        {/* Goals Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {["daily", "short", "long"].map((type) => (
            <div
              key={type}
              className="bg-gray-900/70 p-4 rounded-lg text-white"
            >
              <h2 className="text-lg font-semibold mb-2 capitalize">
                {type} Goals
              </h2>
              <ul className="space-y-2">
                {goals[type].map((goal, i) => (
                  <li key={i}>
                    <input type="checkbox" className="mr-2" /> {goal.text}
                    {goal.due && (
                      <span className="ml-2 text-xs text-gray-300">
                        (due {goal.due})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AffirmationsModal
        show={showAffirmationsModal}
        onClose={() => setShowAffirmationsModal(false)}
        affirmations={affirmations}
        setAffirmations={setAffirmations}
      />

      <BackgroundsModal
        show={showBackgroundsModal}
        onClose={() => setShowBackgroundsModal(false)}
        backgrounds={backgroundImages}
        setBackgrounds={setBackgroundImages}
        timer={timer}
        setTimer={setTimer}
      />
    </div>
  );
}

/* ===========================
   App Root
=========================== */
export default function App() {
  const [currentStreak, setCurrentStreak] = useState(5);
  const [longestStreak, setLongestStreak] = useState(121);
  const [goals, setGoals] = useState({
    daily: [{ text: "Meditate" }, { text: "Workout" }],
    short: [
      { text: "Finish MVP", due: "2025-09-01" },
      { text: "Read 3 books", due: "2025-09-15" },
    ],
    long: [
      { text: "Build Discipline App", due: "2025-12-01" },
      { text: "Master Sexual Energy", due: "2026-03-01" },
    ],
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // IMPORTANT: backgrounds are simple URL strings served by your backend
  const [backgroundImages, setBackgroundImages] = useState([]); // string[]
  const [affirmations, setAffirmations] = useState([
    "Stay strong!",
    "Focus on your goals!",
    "Discipline is freedom!",
  ]);
  const [timer, setTimer] = useState(60000); // ms

  // Load from backend
  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        if (data.streak) {
          setCurrentStreak(data.streak.current || 0);
          setLongestStreak(data.streak.longest || 0);
        }
        if (data.goals) setGoals(data.goals);
        if (data.affirmations) setAffirmations(data.affirmations);

        // Normalize backgrounds to string[]
        if (Array.isArray(data.backgrounds)) {
          const normalized = data.backgrounds.map((b) =>
            typeof b === "string" ? b : b?.url
          ).filter(Boolean);
          setBackgroundImages(normalized);
        }
      })
      .catch((err) => console.error("Failed to load:", err));
  }, []);

  // Save helper
  const saveData = (updates) => {
    fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch((err) => console.error("Failed to save:", err));
  };

  const incrementStreak = () => {
    const newStreak = currentStreak + 1;
    const newLongest = Math.max(longestStreak, newStreak);
    setCurrentStreak(newStreak);
    setLongestStreak(newLongest);
    saveData({ streak: { current: newStreak, longest: newLongest } });
  };

  const resetStreak = () => {
    setCurrentStreak(0);
    saveData({ streak: { current: 0, longest: longestStreak } });
  };

  return (
    <Router>
      <div className="min-h-screen flex bg-gray-800">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } bg-gray-900 text-white shadow-lg p-4 overflow-hidden transition-all duration-300`}
        >
          <h1 className="text-2xl font-bold mb-6">Discipline App</h1>
          <nav className="space-y-3">
            <Link to="/" className="block p-2 rounded hover:bg-gray-700 transition">
              Command Center
            </Link>
            <Link to="/journal" className="block p-2 rounded hover:bg-gray-700 transition">
              Journal
            </Link>
            <Link to="/goals" className="block p-2 rounded hover:bg-gray-700 transition">
              Goals
            </Link>
            <Link to="/calendar" className="block p-2 rounded hover:bg-gray-700 transition">
              Calendar
            </Link>
            <Link to="/stats" className="block p-2 rounded hover:bg-gray-700 transition">
              Stats
            </Link>
            <Link to="/progress-pics" className="block p-2 rounded hover:bg-gray-700 transition">
              Progress Pics
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ☰
          </button>

          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  currentStreak={currentStreak}
                  longestStreak={longestStreak}
                  incrementStreak={incrementStreak}
                  resetStreak={resetStreak}
                  goals={goals}
                  backgroundImages={backgroundImages} // string[]
                  setBackgroundImages={(imgs) => {
                    setBackgroundImages(imgs);
                    saveData({ backgrounds: imgs }); // persist urls
                  }}
                  affirmations={affirmations}
                  setAffirmations={(a) => {
                    setAffirmations(a);
                    saveData({ affirmations: a });
                  }}
                  timer={timer}
                  setTimer={setTimer}
                />
              }
            />
            <Route
              path="/goals"
              element={
                <Goals
                  goals={goals}
                  setGoals={(g) => {
                    setGoals(g);
                    saveData({ goals: g });
                  }}
                />
              }
            />
            <Route path="/journal" element={<Journal />} />
            <Route path="/calendar" element={<Calendar goals={goals} />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/progress-pics" element={<ProgressPics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
