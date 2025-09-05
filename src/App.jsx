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
      const updated = [...backgrounds, data.secure_url];
      setBackgrounds(updated);

      await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgrounds: updated }),
      });
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setNewImage(null);
  };

  const handleDelete = async (index) => {
    const updated = backgrounds.filter((_, i) => i !== index);
    setBackgrounds(updated);
    await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgrounds: updated }),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Manage Backgrounds</h2>
        <ul className="space-y-2 mb-4">
          {backgrounds.map((bg, i) => (
            <li key={i} className="flex justify-between">
              <span>Background {i + 1}</span>
              <button
                className="text-red-400 hover:underline text-sm"
                onClick={() => handleDelete(i)}
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
          className="bg-blue-400 px-4 py-1 rounded hover:bg-blue-500 mt-2"
          onClick={handleAdd}
        >
          Add Background
        </button>
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
   Command Centre Dashboard
=========================== */
function CommandCentre({ setShowAffirmations, setShowBackgrounds }) {
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Discipline Command Centre</h1>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/journal" className="p-4 bg-gray-700 rounded">Journal</Link>
        <Link to="/goals" className="p-4 bg-gray-700 rounded">Goals</Link>
        <Link to="/stats" className="p-4 bg-gray-700 rounded">Stats</Link>
        <Link to="/calendar" className="p-4 bg-gray-700 rounded">Calendar</Link>
        <Link to="/progress-pics" className="p-4 bg-gray-700 rounded">Progress Pics</Link>
        <button onClick={() => setShowAffirmations(true)} className="p-4 bg-gray-700 rounded">
          Affirmations
        </button>
        <button onClick={() => setShowBackgrounds(true)} className="p-4 bg-gray-700 rounded">
          Backgrounds
        </button>
      </div>
    </div>
  );
}

/* ===========================
   App Root
=========================== */
function App() {
  const [showAffirmations, setShowAffirmations] = useState(false);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [affirmations, setAffirmations] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/data");
      const data = await res.json();
      setAffirmations(data.affirmations || []);
      setBackgrounds(data.backgrounds || []);
    })();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <CommandCentre
              setShowAffirmations={setShowAffirmations}
              setShowBackgrounds={setShowBackgrounds}
            />
          }
        />
        <Route path="/journal" element={<Journal />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/calendar" element={<Calendar />} />
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
    </Router>
  );
}

export default App;
