"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function TeacherDashboard() {

  const { data: session, status } = useSession();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    // Noch nicht geladen → abbrechen
    if (status === "loading") return;

    // Nicht eingeloggt → redirect
    if (!session?.user) {
      window.location.href = "/";
      return;
    }

    async function load() {
      try {
        setError(null);

        const res = await fetch(
          `/api/bookings/teacher?teacherId=${session.user.id}`,
          { cache: "no-store" }
        );

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
  }, [session, status]);


  if (status === "loading" || loading) {
    return <p className="p-10">Lade…</p>;
  }

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Lehrer-Dashboard</h1>

      {error && (
        <p className="text-red-600 mb-4">Fehler: {error}</p>
      )}

      {bookings.length === 0 ? (
        <p className="text-gray-600">Keine Termine gefunden.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => (
            <div key={b.id} className="p-4 bg-white border rounded">
              <p><strong>Start:</strong> {new Date(b.start).toLocaleString("de-DE")}</p>
              <p><strong>Ende:</strong> {new Date(b.end).toLocaleString("de-DE")}</p>
              <p><strong>Schüler:</strong> {b.student?.name || b.student?.email}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
