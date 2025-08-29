import { useState } from "react";

export default function Goals({ goals, setGoals, user, setUser }) {
  const [inputs, setInputs] = useState({ daily: "", short: "", long: "" });
  const [editing, setEditing] = useState({ type: null, index: null });

  // ✅ Save to backend
  const saveToBackend = async (updatedGoals) => {
    const updatedUser = { ...user, goals: updatedGoals };
    setUser(updatedUser);
    setGoals(updatedGoals);

    try {
      await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
    } catch (err) {
      console.error("Failed to save goals:", err);
    }
  };

  const handleAddGoal = (type) => {
    if (!inputs[type]) return;

    const updatedGoals = {
      ...goals,
      [type]: [
        ...goals[type],
        type === "daily" ? { text: inputs[type] } : { text: inputs[type], due: "" },
      ],
    };

    saveToBackend(updatedGoals);
    setInputs((prev) => ({ ...prev, [type]: "" }));
  };

  const handleDeleteGoal = (type, index) => {
    const updatedGoals = {
      ...goals,
      [type]: goals[type].filter((_, i) => i !== index),
    };

    saveToBackend(updatedGoals);
  };

  const handleEditGoal = (type, index) => {
    setEditing({ type, index });
    setInputs((prev) => ({ ...prev, [type]: goals[type][index].text }));
  };

  const handleSaveEdit = (type) => {
    const index = editing.index;
    const updatedGoals = {
      ...goals,
      [type]: goals[type].map((g, i) =>
        i === index
          ? type === "daily"
            ? { text: inputs[type] }
            : { ...g, text: inputs[type] }
          : g
      ),
    };

    saveToBackend(updatedGoals);
    setEditing({ type: null, index: null });
    setInputs((prev) => ({ ...prev, [type]: "" }));
  };

  const handleDueChange = (type, index, due) => {
    const updatedGoals = {
      ...goals,
      [type]: goals[type].map((g, i) =>
        i === index ? { ...g, due } : g
      ),
    };

    saveToBackend(updatedGoals);
  };

  const renderSection = (type, title, showDue = false) => (
    <div className="bg-white shadow p-4 rounded-lg flex-1">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ul className="space-y-2">
        {goals[type].map((goal, i) => (
          <li key={i} className="flex justify-between items-center">
            {editing.type === type && editing.index === i ? (
              <input
                type="text"
                value={inputs[type]}
                onChange={(e) => setInputs((prev) => ({ ...prev, [type]: e.target.value }))}
                className="border p-1 rounded flex-1 mr-2"
              />
            ) : (
              <span>
                {goal.text}{" "}
                {showDue && goal.due && (
                  <span className="text-xs text-gray-500 ml-1">(due {goal.due})</span>
                )}
              </span>
            )}
            <div className="flex gap-1">
              {editing.type === type && editing.index === i ? (
                <button
                  onClick={() => handleSaveEdit(type)}
                  className="text-green-500 hover:underline text-xs"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => handleEditGoal(type, i)}
                  className="text-blue-500 hover:underline text-xs"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDeleteGoal(type, i)}
                className="text-red-500 hover:underline text-xs"
              >
                Delete
              </button>
              {showDue && editing.type !== type && (
                <input
                  type="date"
                  value={goal.due || ""}
                  onChange={(e) => handleDueChange(type, i, e.target.value)}
                  className="border p-1 rounded text-xs"
                />
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Add Goal */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          placeholder="New goal"
          value={inputs[type]}
          onChange={(e) => setInputs((prev) => ({ ...prev, [type]: e.target.value }))}
          className="border p-1 rounded flex-1"
        />
        <button
          onClick={() => handleAddGoal(type)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 flex-wrap">
      {renderSection("daily", "Daily Goals")}
      {renderSection("short", "Short Term Goals", true)}
      {renderSection("long", "Long Term Goals", true)}
    </div>
  );
}
