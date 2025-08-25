import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";

export default function Calendar({ goals }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([
    { title: "Birthday 🎉", date: format(new Date(), "yyyy-MM-dd") },
  ]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: "", date: "" });

  // Combine goals with due dates into events
  const allEvents = [
    ...events,
    ...goals.short.filter((g) => g.due).map((g) => ({ title: g.text, date: g.due })),
    ...goals.long.filter((g) => g.due).map((g) => ({ title: g.text, date: g.due })),
  ];

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ‹
      </button>
      <h2 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ›
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const date = startOfWeek(currentMonth, { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
      const dayName = format(addDays(date, i), "EEE");
      days.push(
        <div key={i} className="text-center font-semibold text-gray-600">
          {dayName}
        </div>
      );
    }
    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const isoDate = format(day, "yyyy-MM-dd");
        const dayEvents = allEvents.filter((e) => e.date === isoDate);

        // Determine weekend style
        const isWeekend = [0, 6].includes(day.getDay());
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day}
            className={`border p-2 h-28 overflow-y-auto relative rounded-lg ${
              !isSameMonth(day, monthStart) ? "bg-gray-100 text-gray-400" : ""
            } ${isWeekend ? "bg-red-50" : ""} ${isToday ? "bg-yellow-200" : ""}`}
          >
            <span
              className={`block text-sm font-semibold ${
                isToday ? "text-yellow-800" : ""
              }`}
            >
              {formattedDate}
            </span>

            {/* Events */}
            {dayEvents.map((event, i) => (
              <div
                key={i}
                className="bg-blue-100 text-blue-800 rounded px-1 mt-1 text-xs truncate cursor-pointer hover:bg-blue-200"
                onClick={() => {
                  setEditingEvent({ ...event });
                  setShowEventForm(true);
                  setNewEvent({ ...event });
                }}
              >
                {event.title}
              </div>
            ))}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day} className="grid grid-cols-7 gap-1">{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  const handleAddOrEditEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;

    if (editingEvent) {
      // Edit existing event
      setEvents((prev) =>
        prev.map((ev) => (ev === editingEvent ? { ...newEvent } : ev))
      );
      setEditingEvent(null);
    } else {
      // Add new event
      setEvents([...events, newEvent]);
    }

    setNewEvent({ title: "", date: "" });
    setShowEventForm(false);
  };

  const handleDeleteEvent = () => {
    if (!editingEvent) return;
    setEvents(events.filter((ev) => ev !== editingEvent));
    setEditingEvent(null);
    setShowEventForm(false);
  };

  return (
    <div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Add/Edit Event */}
      <div className="mt-6">
        {!showEventForm ? (
          <button
            onClick={() => setShowEventForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Add Event
          </button>
        ) : (
          <form onSubmit={handleAddOrEditEvent} className="space-y-2 mt-4 w-64">
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, title: e.target.value }))
              }
              className="border p-2 rounded w-full"
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, date: e.target.value }))
              }
              className="border p-2 rounded w-full"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Save
              </button>
              {editingEvent && (
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                  setNewEvent({ title: "", date: "" });
                }}
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
