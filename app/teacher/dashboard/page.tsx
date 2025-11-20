"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  start: string;
  end: string | null;
  student: {
    name: string | null;
    email: string;
  };
};

export default function TeacherDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/teacher/bookings", {
          cache: "no-store",
        });
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dein Lehrer-Dashboard</h1>

      {loading && <p>Lade Termine…</p>}

      {!loading && bookings.length === 0 && (
        <p className="text-gray-600">Keine Termine vorhanden.</p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-4 bg-white rounded-lg shadow border"
            >
              <p>
                <strong>
                  {new Date(b.start).toLocaleString("de-DE")}
                </strong>
              </p>

              {b.end && (
                <p>
                  Ende:{" "}
                  {new Date(b.end).toLocaleTimeString("de-DE")}
                </p>
              )}

              <p className="text-gray-600">
                Schüler: {b.student?.name ?? b.student?.email}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
