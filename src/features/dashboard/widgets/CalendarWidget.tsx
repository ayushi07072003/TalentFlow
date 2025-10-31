// ...existing code...

function getMonthMatrix(year: number, month: number) {
  // Returns a matrix of weeks, each week is an array of days (number or null)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = [];
  let dayOfWeek = firstDay.getDay();
  // Fill initial empty days
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  // Fill trailing empty days
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

import { useState } from "react";

export function CalendarWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weeks = getMonthMatrix(year, month);

  // --- Todo list state ---
  const [todos, setTodos] = useState<{ [day: number]: string[] }>({});
  const [todoInput, setTodoInput] = useState("");
  const [todoDay, setTodoDay] = useState(today);

  function addTodo() {
    if (!todoInput.trim()) return;
    setTodos((prev) => ({
      ...prev,
      [todoDay]: [...(prev[todoDay] || []), todoInput.trim()]
    }));
    setTodoInput("");
  }

  // --- Simulated apply rates ---
  // For demo: random rates per day, but could be fetched from API
  function getApplyRate(day: number) {
    // Simulate: low (green), med (yellow), high (red)
    if (!day) return null;
    const val = (day * month + year) % 10;
    if (val < 4) return "low";
    if (val < 7) return "med";
    return "high";
  }
  const rateLabel = {
    low: "Low",
    med: "Medium",
    high: "High"
  };

  return (
    <div className="card bg-white rounded-lg shadow p-4 flex flex-col items-center w-full">
      <div className="font-bold text-lg mb-2">{monthNames[month]} {year}</div>
      {/* Todo input */}
      <div className="mb-3 w-full flex flex-col items-center">
        <div className="flex gap-2 mb-1">
          <input
            type="number"
            min={1}
            max={31}
            value={todoDay}
            onChange={e => setTodoDay(Number(e.target.value))}
            className="border rounded px-2 py-1 w-16 text-xs"
            placeholder="Day"
          />
          <input
            type="text"
            value={todoInput}
            onChange={e => setTodoInput(e.target.value)}
            className="border rounded px-2 py-1 text-xs"
            placeholder="Add todo for day"
          />
          <button
            onClick={addTodo}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >Add</button>
        </div>
        {todos[todoDay]?.length ? (
          <div className="text-xs text-gray-700">Todos for day {todoDay}: {todos[todoDay].join(", ")}</div>
        ) : null}
      </div>
      {/* Legend for apply rate */}
      <div className="flex gap-3 mb-2 text-xs items-center">
        <span>Apply Rate:</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-400" /> Low</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400" /> Medium</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-400" /> High</span>
      </div>
      <div className="grid grid-cols-7 gap-1 w-full text-center text-xs mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="font-semibold text-gray-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 w-full text-center">
        {weeks.flat().map((day, i) => {
          const rate = getApplyRate(day || 0);
          return day ? (
            <div
              key={i}
              className={`relative px-2 py-1 flex flex-col items-center justify-center ${day === today ? "bg-blue-500 text-white font-bold" : "bg-gray-100 text-gray-700"}`}
            >
              <span
                className={
                  rate && day <= today
                    ? `w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                        rate === "low"
                          ? "border-green-400"
                          : rate === "med"
                          ? "border-yellow-400"
                          : "border-red-400"
                      }`
                    : ""
                }
                title={rate && day <= today ? rateLabel[rate] : undefined}
              >
                {day}
              </span>
              {/* Todo list for this day */}
              {todos[day]?.length ? (
                <span className="block mt-1 text-[10px] text-blue-700">{todos[day].length} todo{todos[day].length > 1 ? "s" : ""}</span>
              ) : null}
            </div>
          ) : (
            <div key={i} />
          );
        })}
      </div>
    </div>
  );
}
