"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Slot = {
  id: string;
  date: string;
  start: string;
  end: string;
};

export default function TeacherAvailabilityPage() {
  const { data: session } = useSession();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Slots laden
  async function loadAvailability() {
    if (!session?.user?.email) return;

    const res = await fetch(
      `/api/teacher/availability?email=${session.user.email}`
    );
    const data = await res.json();
    setSlots(data.slots || []);
  }

  // 🔹 Slot hinzufügen
  async function addSlot() {
    if (!date || !start || !end) return;

    setLoading(true);

    await fetch("/api/teacher/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session?.user?.email,
        date,
        start,
        end,
      }),
    });

    setDate("");
    setStart("");
    setEnd("");

    await loadAvailability();
    setLoading(false);
  }

  // 🔹 Slot löschen
  async function deleteSlot(id: string) {
    await fetch(`/api/teacher/availability/${id}`, {
      method: "DELETE",
    });

    await loadAvailability();
  }

  useEffect(() => {
    loadAvailability();
  }, [session?.user?.email]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold">Meine Verfügbarkeit</h1>

      {/* ➕ Slot hinzufügen */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Zeitfenster hinzufügen</h2>

        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={addSlot}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Hinzufügen
        </button>
      </div>

      {/* 📋 Slots anzeigen */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Eingetragene Zeiten</h2>

        {slots.length === 0 && (
          <p className="text-gray-500">Noch keine Zeiten eingetragen.</p>
        )}

        {slots.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between border rounded-lg px-4 py-3"
          >
            <div>
              <div className="font-medium">
                {new Date(slot.date).toLocaleDateString("de-DE")}
              </div>
              <div className="text-sm text-gray-600">
                {slot.start} – {slot.end}
              </div>
            </div>

            <button
              onClick={() => deleteSlot(slot.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Löschen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
