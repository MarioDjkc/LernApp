// app/teacher/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  start: string;
  end: string;
  status: string;
  student: {
    name: string | null;
    email: string;
  };
};

export default function TeacherDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const res = await fetch("/api/teacher/bookings", {
          cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.error || `Fehler ${res.status}`);
        }

        setBookings(data.bookings || []);
      } catch (e: any) {
        console.error("Dashboard Fehler:", e);
        setError(e?.message ?? "Fehler beim Laden der Termine.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f5fb] px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Lehrer-Dashboard</h1>

        <h2 className="text-xl font-semibold mb-4">Deine Termine</h2>

        {loading && <p>Lade Termine…</p>}

        {error && !loading && (
          <p className="text-red-600 mb-4 whitespace-pre-line">{error}</p>
        )}

        {!loading && !error && bookings.length === 0 && (
          <p className="text-gray-600">
            Noch keine Terminanfragen vorhanden.
          </p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((b) => {
              const start = new Date(b.start);
              const end = new Date(b.end);

              return (
                <div
                  key={b.id}
                  className="p-4 bg-white border rounded-lg shadow-sm"
                >
                  <p className="font-semibold">
                    {start.toLocaleDateString("de-DE")}{" "}
                    {start.toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {end &&
                      " - " +
                        end.toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </p>

                  <p className="text-gray-700 mt-1">
                    Schüler: {b.student?.name ?? b.student?.email}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Status: {b.status}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
