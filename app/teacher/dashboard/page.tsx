"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

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
  const { data: session, status } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------
  // 🔹 BOOKINGS LADEN
  // -------------------------------
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) return;

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

  // -------------------------------
  // 🔹 EVENTS FÜR FULLCALENDAR
  // -------------------------------
  const events = bookings.map((b) => ({
    id: b.id,
    title: `Termin mit ${b.student.name ?? b.student.email}`,
    start: b.start,
    end: b.end ?? undefined,
    backgroundColor: "#3b82f6",
    borderColor: "#1d4ed8",
    textColor: "white",
  }));

  // -------------------------------
  // 🔹 UI
  // -------------------------------
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Lehrer-Dashboard</h1>

      <h2 className="text-xl font-semibold mb-4">Kalender</h2>

      {loading && <p>Lade Kalender…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white p-4 rounded-xl shadow border">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="de"
            height="auto"
            events={events}
            eventDisplay="block"
            editable={false}
            headerToolbar={{
              left: "today prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
          />
        </div>
      )}
    </main>
  );
}
