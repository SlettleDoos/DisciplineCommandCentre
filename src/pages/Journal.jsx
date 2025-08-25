import { useState, useEffect } from "react";
import {
  parseISO,
  format,
  getWeek,
  getYear,
} from "date-fns";

export default function Journal() {
  const [entry, setEntry] = useState("");
  const [date, setDate] = useState("");
  const [mood, setMood] = useState("good");
  const [tags, setTags] = useState([]);
  const [entries, setEntries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Collapse state
  const [collapsedYears, setCollapsedYears] = useState({});
  const [collapsedMonths, setCollapsedMonths] = useState({});
  const [collapsedWeeks, setCollapsedWeeks] = useState({});
  const [collapsedDays, setCollapsedDays] = useState({});

  // Filters
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [moodFilter, setMoodFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const tagOptions = ["E Boost", "T Boost", "Shake", "Workout", "Jelq"];

  useEffect(() => {
    const saved = localStorage.getItem("journal");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveEntries = (newEntries) => {
    // Always sort newest → oldest
    newEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    setEntries(newEntries);
    localStorage.setItem("journal", JSON.stringify(newEntries));
  };

  const addOrEditEntry = () => {
    if (!entry.trim()) return;

    const entryDate = date || new Date().toISOString().split("T")[0];
    let newEntries;

    const newEntry = { text: entry, date: entryDate, mood, tags };

    if (editingIndex !== null) {
      newEntries = [...entries];
      newEntries[editingIndex] = newEntry;
      setEditingIndex(null);
    } else {
      newEntries = [...entries, newEntry];
    }

    saveEntries(newEntries);
    setEntry("");
    setDate("");
    setMood("good");
    setTags([]);
  };

  const deleteEntry = (idx) => {
    const newEntries = entries.filter((_, i) => i !== idx);
    saveEntries(newEntries);
  };

  const startEdit = (idx) => {
    setEntry(entries[idx].text);
    setDate(entries[idx].date);
    setMood(entries[idx].mood || "good");
    setTags(entries[idx].tags || []);
    setEditingIndex(idx);
  };

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const moodColors = {
    great: "bg-green-500 text-white",
    good: "bg-blue-500 text-white",
    meh: "bg-yellow-500 text-white",
  };

  // ---------- FILTER + SORT ----------
  const filteredEntries = entries
    .filter((e) =>
      search ? e.text.toLowerCase().includes(search.toLowerCase()) : true
    )
    .filter((e) => (moodFilter === "all" ? true : e.mood === moodFilter))
    .filter((e) => (tagFilter === "all" ? true : e.tags?.includes(tagFilter)))
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  // ---------- GROUPING ----------
  const groupEntries = () => {
    const groups = {};
    filteredEntries.forEach((e) => {
      const d = parseISO(e.date);
      const year = getYear(d);
      const month = format(d, "MMMM yyyy");
      const week = `Week ${getWeek(d)}`;
      const day = format(d, "d MMM (EEE)");

      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = {};
      if (!groups[year][month][week]) groups[year][month][week] = {};
      if (!groups[year][month][week][day]) groups[year][month][week][day] = [];

      groups[year][month][week][day].push(e);
    });
    return groups;
  };

  const grouped = groupEntries();

  const moodSummary = (entries) => {
    const counts = { great: 0, good: 0, meh: 0 };
    entries.forEach((e) => counts[e.mood]++);
    return Object.keys(counts).reduce((a, b) =>
      counts[a] >= counts[b] ? a : b
    );
  };

  // Toggle helpers
  const toggleYear = (year) =>
    setCollapsedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  const toggleMonth = (month) =>
    setCollapsedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  const toggleWeek = (week) =>
    setCollapsedWeeks((prev) => ({ ...prev, [week]: !prev[week] }));
  const toggleDay = (day) =>
    setCollapsedDays((prev) => ({ ...prev, [day]: !prev[day] }));

  // Expandable text component
  const ExpandableText = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    if (text.length <= 200) return <p>{text}</p>;
    return (
      <div>
        <p>{expanded ? text : text.slice(0, 200) + "..."}</p>
        <button
          className="text-blue-500 text-sm mt-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Journal</h1>
      <p className="text-gray-500 mb-4">{new Date().toDateString()}</p>

      {/* Form */}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your thoughts..."
        className="w-full p-3 border rounded-lg shadow-sm mb-3"
        rows="4"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded-lg shadow-sm mb-3"
      />

      <div className="flex gap-2 mb-3">
        {["great", "good", "meh"].map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`px-3 py-1 rounded-lg capitalize ${
              mood === m ? moodColors[m] : "bg-gray-200 text-gray-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {tagOptions.map((t) => (
          <button
            key={t}
            onClick={() => toggleTag(t)}
            className={`px-3 py-1 rounded-lg text-sm ${
              tags.includes(t)
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        onClick={addOrEditEntry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {editingIndex !== null ? "Update Entry" : "Save Entry"}
      </button>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Grouped view */}
      <div className="mt-6 space-y-6">
        {Object.keys(grouped).length === 0 && (
          <p className="text-gray-500">No entries yet.</p>
        )}

        {Object.entries(grouped).map(([year, months]) => (
          <div key={year}>
            <h2
              className="text-xl font-bold mb-2 cursor-pointer"
              onClick={() => toggleYear(year)}
            >
              {collapsedYears[year] ? "▶" : "▼"} {year}
            </h2>
            {!collapsedYears[year] &&
              Object.entries(months).map(([month, weeks]) => (
                <div key={month} className="ml-4">
                  <h3
                    className="text-lg font-semibold mb-2 cursor-pointer"
                    onClick={() => toggleMonth(month)}
                  >
                    {collapsedMonths[month] ? "▶" : "▼"} {month}
                  </h3>
                  {!collapsedMonths[month] &&
                    Object.entries(weeks).map(([week, days]) => (
                      <div key={week} className="ml-6 mb-3">
                        <h4
                          className="font-medium cursor-pointer"
                          onClick={() => toggleWeek(week)}
                        >
                          {collapsedWeeks[week] ? "▶" : "▼"} {week}
                        </h4>
                        {!collapsedWeeks[week] &&
                          Object.entries(days).map(([day, es]) => (
                            <div key={day} className="ml-8">
                              <h5
                                className="cursor-pointer"
                                onClick={() => toggleDay(day)}
                              >
                                {collapsedDays[day] ? "▶" : "▼"} {day}
                              </h5>
                              {!collapsedDays[day] &&
                                es.map((e, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white shadow rounded-lg p-3 flex justify-between items-start mt-2"
                                  >
                                    <div>
                                      <span
                                        className={`inline-block px-2 py-1 text-xs rounded-lg font-medium ${moodColors[e.mood]}`}
                                      >
                                        {e.mood}
                                      </span>
                                      {e.tags?.length > 0 && (
                                        <div className="mt-1 flex gap-1 flex-wrap">
                                          {e.tags.map((t) => (
                                            <span
                                              key={t}
                                              className="bg-purple-200 text-purple-800 text-xs px-2 py-0.5 rounded-lg"
                                            >
                                              {t}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      <ExpandableText text={e.text} />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          startEdit(entries.indexOf(e))
                                        }
                                        className="text-blue-500 hover:text-blue-700 font-semibold"
                                      >
                                        ✎
                                      </button>
                                      <button
                                        onClick={() =>
                                          deleteEntry(entries.indexOf(e))
                                        }
                                        className="text-red-500 hover:text-red-700 font-semibold"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
