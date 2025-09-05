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
   Backgrounds Modal (Cloudinary)
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

    // IMPORTANT: use your own values here 👇
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      const servedUrl = data.secure_url;

      const updated = [...backgrounds, servedUrl];
      setBackgrounds(updated);

      await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgrounds: updated }),
      });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check your Cloudinary setup.");
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

function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-800 text-white flex gap-4">
        <Link to="/">Journal</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/stats">Stats</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/progress-pics">Progress Pics</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Journal />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/progress-pics" element={<ProgressPics />} />
      </Routes>
    </Router>
  );
}


export default App;


/* ===========================
   Dashboard + App Root
=========================== */
// ⬆ keep everything else the same from your original App.jsx (Dashboard + export default App)

