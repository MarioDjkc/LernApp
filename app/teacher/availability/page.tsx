"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Slot = {
  id: string;
  date: string;
  start: string;
  end: string;
  subject?: string | null; // "ALL" oder konkretes Fach
};

export default function TeacherAvailabilityPage() {
  const { data: session, status } = useSession();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");

  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAvailability() {
    if (!session?.user?.email) return;

    const res = await fetch(
      `/api/teacher/availability?email=${encodeURIComponent(session.user.email)}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    setSlots(data.slots || []);
    setSubjects(data.subjects || []); // ✅ kommt jetzt aus derselben Route
  }

  async function addSlot() {
    if (!date || !start || !end) return;
    if (!session?.user?.email) return;

    setLoading(true);

    await fetch("/api/teacher/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        date,
        start,
        end,
        subject: selectedSubject, // ✅ ALL oder Fach
      }),
    });

    setDate("");
    setStart("");
    setEnd("");
    setSelectedSubject("ALL");

    await loadAvailability();
    setLoading(false);
  }

  async function deleteSlot(id: string) {
    await fetch(`/api/teacher/availability/${id}`, { method: "DELETE" });
    await loadAvailability();
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Meine Verfügbarkeit
      </h1>

      {/* ➕ Slot hinzufügen */}
      <div className="bg-white rounded-2xl shadow p-8 space-y-6 border border-gray-100">
        <h2 className="text-2xl font-bold">Zeitfenster hinzufügen</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-xl px-4 py-3 text-lg"
          />

          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border rounded-xl px-4 py-3 text-lg"
          />

          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border rounded-xl px-4 py-3 text-lg"
          />

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border rounded-xl px-4 py-3 text-lg min-w-[220px]"
          >
            <option value="ALL">Alle Fächer</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addSlot}
          disabled={loading || !date || !start || !end}
          className="
            bg-blue-600 text-white px-8 py-3 rounded-xl text-lg font-semibold
            hover:bg-blue-700 disabled:opacity-60
          "
        >
          {loading ? "Speichern..." : "Hinzufügen"}
        </button>

        {subjects.length === 0 && (
          <p className="text-sm text-gray-500">
            ⚠️ Keine Fächer gefunden. Stelle sicher, dass im Teacher in der DB
            im Feld <b>subject</b> z.B. <b>Englisch,Mathematik</b> steht.
          </p>
        )}
      </div>

      {/* 📋 Slots anzeigen */}
      <div className="bg-white rounded-2xl shadow p-8 space-y-4 border border-gray-100">
        <h2 className="text-2xl font-bold">Eingetragene Zeiten</h2>

        {slots.length === 0 && (
          <p className="text-gray-500">Noch keine Zeiten eingetragen.</p>
        )}

        {slots.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between border rounded-xl px-5 py-4"
          >
            <div>
              <div className="font-semibold text-lg">
                {new Date(slot.date).toLocaleDateString("de-DE")}
              </div>

              <div className="text-gray-600">
                {slot.start} – {slot.end}
              </div>

              <div className="text-sm text-gray-500 mt-1">
                Fach:{" "}
                <span className="font-medium">
                  {slot.subject && slot.subject !== "ALL"
                    ? slot.subject
                    : "Alle Fächer"}
                </span>
              </div>
            </div>

            <button
              onClick={() => deleteSlot(slot.id)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Löschen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
