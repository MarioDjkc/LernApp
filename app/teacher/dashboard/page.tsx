"use client";

import { useEffect, useState } from "react";
import TeacherCalendar from "./TeacherCalendar";

export default function TeacherDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setError(null);
      const res = await fetch("/api/bookings/teacher", { cache: "no-store" });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Fehler ${res.status}`);
      }

      setEvents(data.events || []);
    } catch (e: any) {
      setError(e?.message || "Fehler beim Laden des Kalenders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f5fb] p-10">
      <h1 className="text-3xl font-bold">Lehrer-Dashboard</h1>

      {loading && <p>Laden…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && <TeacherCalendar events={events} />}
    </main>
  );
}
