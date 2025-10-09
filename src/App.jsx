import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Journal from "./pages/Journal";
import Goals from "./pages/Goals";
import Stats from "./pages/Stats";
import Calendar from "./pages/Calendar";
import ProgressPics from "./pages/ProgressPics";

/* ===========================
   Navbar
=========================== */
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md text-white px-6 py-3 flex justify-center gap-8 z-40">
      <Link to="/">Home</Link>
      <Link to="/journal">Journal</Link>
      <Link to="/goals">Goals</Link>
      <Link to="/stats">Stats</Link>
      <Link to="/calendar">Calendar</Link>
      <Link to="/progress-pics">Progress Pics</Link>
    </nav>
  );
}

/* ===========================
   Command Centre Home
   (Daily goals left, longer term goals right, checkboxes)
=========================== */
function CommandCentre({
  affirmations,
  goals,
  setShowAffirmations,
  setShowBackgrounds,
  setGoals,
}) {
  // Handler for checking/unchecking a goal
  const handleCheck = (type, idx) => {
    const updatedGoals = {
      ...goals,
      [type]: goals[type].map((g, i) =>
        i === idx ? { ...g, done: !g.done } : g
      ),
    };
    setGoals(updatedGoals);
    // Optionally persist to backend:
    fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals: updatedGoals }),
    });
  };

  return (
    <div className="pt-24 px-6 text-white relative z-10 flex flex-col items-center min-h-screen">
      {/* Big Title */}
      <h1 className="text-5xl md:text-6xl font-extrabold mb-10 drop-shadow-lg text-center">
        Discipline Command Centre
      </h1>

      {/* Goals Section: Daily (Left), Short/Long (Right) */}
      <div className="flex w-full max-w-4xl gap-10 mb-10">
        {/* Daily Goals - Left */}
        <div className="flex-1 bg-black/70 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-left">Daily Goals</h2>
          {goals.daily?.length > 0 ? (
            <ul className="space-y-3">
              {goals.daily.map((g, i) => (
                <li
                  key={`daily-${i}`}
                  className="bg-white/10 p-3 rounded-lg flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={g.done || false}
                    onChange={() => handleCheck("daily", i)}
                    className="accent-green-500 w-5 h-5"
                  />
                  <span className={g.done ? "line-through text-gray-400" : ""}>{g.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-300">No daily goals set yet.</p>
          )}
        </div>

        {/* Short & Long Goals - Right */}
        <div className="flex-1 bg-black/70 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-left">Longer Term Goals</h2>
          {goals.short?.length > 0 && (
            <>
              <h3 className="font-semibold text-lg mb-2">Short Term</h3>
              <ul className="space-y-3 mb-4">
                {goals.short.map((g, i) => (
                  <li
                    key={`short-${i}`}
                    className="bg-white/10 p-3 rounded-lg flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={g.done || false}
                      onChange={() => handleCheck("short", i)}
                      className="accent-blue-500 w-5 h-5"
                    />
                    <span className={g.done ? "line-through text-gray-400" : ""}>{g.text}</span>
                    {g.due && (
                      <span className="text-xs text-gray-400 ml-2">(due {g.due})</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          {goals.long?.length > 0 && (
            <>
              <h3 className="font-semibold text-lg mb-2">Long Term</h3>
              <ul className="space-y-3">
                {goals.long.map((g, i) => (
                  <li
                    key={`long-${i}`}
                    className="bg-white/10 p-3 rounded-lg flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={g.done || false}
                      onChange={() => handleCheck("long", i)}
                      className="accent-purple-500 w-5 h-5"
                    />
                    <span className={g.done ? "line-through text-gray-400" : ""}>{g.text}</span>
                    {g.due && (
                      <span className="text-xs text-gray-400 ml-2">(due {g.due})</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          {!goals.short?.length && !goals.long?.length && (
            <p className="text-gray-300">No longer term goals set yet.</p>
          )}
        </div>
      </div>

      {/* Affirmations - Smaller below */}
      <div className="bg-black/60 p-4 rounded-2xl shadow-lg w-full max-w-md mb-6">
        <h2 className="text-xl font-bold mb-3 text-center">Affirmations</h2>
        {affirmations.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {affirmations.map((a, i) => (
              <li
                key={i}
                className="bg-white/10 p-2 rounded-lg text-center"
              >
                {a}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-300 text-center">No affirmations yet.</p>
        )}
      </div>

      {/* Manage Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setShowAffirmations(true)}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
        >
          Manage Affirmations
        </button>
        <button
          onClick={() => setShowBackgrounds(true)}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
        >
          Manage Backgrounds
        </button>
      </div>
    </div>
  );
}

/* ===========================
   Affirmations Modal
=========================== */
function AffirmationsModal({ show, onClose, affirmations, setAffirmations }) {
  const [input, setInput] = useState("");
  if (!show) return null;

  const handleAdd = async () => {
    if (!input.trim()) return;
    const updated = [...affirmations, input.trim()];
    setAffirmations(updated);
    setInput("");
    await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ affirmations: updated }),
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Manage Affirmations</h2>
        <ul className="space-y-2 mb-4">
          {affirmations.map((a, i) => (
            <li key={i} className="flex justify-between">
              <span>{a}</span>
              <button
                className="text-red-400"
                onClick={async () => {
                  const updated = affirmations.filter((_, idx) => idx !== i);
                  setAffirmations(updated);
                  await fetch("/api/data", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ affirmations: updated }),
                  });
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <input
          className="w-full p-2 mb-2 text-black rounded"
          placeholder="New affirmation"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-green-500 px-3 py-1 rounded w-full"
        >
          Add
        </button>
        <button
          className="mt-4 bg-gray-700 px-4 py-1 rounded w-full"
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
=========================== */
function BackgroundsModal({ show, onClose, backgrounds, setBackgrounds }) {
  const [newImage, setNewImage] = useState(null);
  if (!show) return null;

  const handleAdd = async () => {
    if (!newImage) return;
    const formData = new FormData();
    formData.append("file", newImage);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (!res.ok || !data.secure_url) {
        alert("Upload failed: " + (data.error?.message || "Unknown error"));
        return;
      }

      const updated = [...backgrounds, data.secure_url];
      setBackgrounds(updated);

      const saveRes = await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgrounds: updated }),
      });

      if (!saveRes.ok) {
        alert("Failed to save backgrounds to server");
      }

      setNewImage(null);
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Manage Backgrounds</h2>
        <ul className="space-y-2 mb-4">
          {backgrounds.map((bg, i) => (
            <li key={i} className="flex justify-between">
              <span>Background {i + 1}</span>
              <button
                className="text-red-400"
                onClick={async () => {
                  const updated = backgrounds.filter((_, idx) => idx !== i);
                  setBackgrounds(updated);
                  await fetch("/api/data", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ backgrounds: updated }),
                  });
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewImage(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 px-3 py-1 rounded w-full mt-2"
        >
          Add
        </button>
        <button
          className="mt-4 bg-gray-700 px-4 py-1 rounded w-full"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* ===========================
   App Root with Background Slideshow
=========================== */
function App() {
  const [showAffirmations, setShowAffirmations] = useState(false);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [affirmations, setAffirmations] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [goals, setGoals] = useState({ daily: [], short: [], long: [] });
  const [user, setUser] = useState({});
  const [bgIndex, setBgIndex] = useState(0);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/data");
      const data = await res.json();
      setAffirmations(data.affirmations || []);
      setBackgrounds(data.backgrounds || []);
      setGoals(data.goals || { daily: [], short: [], long: [] });
      setUser(data.user || {});
    })();
  }, []);

  // Cycle background
  useEffect(() => {
    if (backgrounds.length === 0) return;
    const interval = setInterval(() => {
      setBgIndex((i) => (i + 1) % backgrounds.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  return (
    <Router>
      {/* Background slideshow */}
      {backgrounds.length > 0 ? (
        <div
          className="fixed inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
        ></div>
      ) : (
        <div className="fixed inset-0 bg-gradient-to-r from-gray-800 to-black"></div>
      )}

      {/* Overlay */}
      <div className="relative z-10 min-h-screen bg-black/60">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <CommandCentre
                affirmations={affirmations}
                goals={goals}
                setShowAffirmations={setShowAffirmations}
                setShowBackgrounds={setShowBackgrounds}
                setGoals={setGoals}
              />
            }
          />
          <Route path="/journal" element={<Journal />} />
          <Route path="/goals" element={
            <Goals
              goals={goals}
              setGoals={setGoals}
              user={user}
              setUser={setUser}
            />
          } />
          <Route path="/stats" element={<Stats />} />
          <Route path="/calendar" element={<Calendar goals={goals} />} />
          <Route path="/progress-pics" element={<ProgressPics />} />
        </Routes>

        {/* Modals */}
        <AffirmationsModal
          show={showAffirmations}
          onClose={() => setShowAffirmations(false)}
          affirmations={affirmations}
          setAffirmations={setAffirmations}
        />
        <BackgroundsModal
          show={showBackgrounds}
          onClose={() => setShowBackgrounds(false)}
          backgrounds={backgrounds}
          setBackgrounds={setBackgrounds}
        />
      </div>
    </Router>
  );
}

export default App;