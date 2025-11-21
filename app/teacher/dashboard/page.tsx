// app/teacher/dashboard/page.tsx
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
  end: string;
  status: string;
  student?: {
    name: string | null;
    email: string;
  } | null;
};

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // ohne E-Mail können wir den Lehrer nicht finden
    if (!session?.user?.email) {
      setError("Kein Lehrer eingeloggt (E-Mail fehlt in der Session).");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch(
          `/api/bookings/teacher?email=${encodeURIComponent(
            session.user.email
          )}`,
          { cache: "no-store" }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.error || `Fehler ${res.status}`);
        }

        console.log("Teacher bookings:", data.bookings);
        setBookings(data.bookings || []);
      } catch (e: any) {
        console.error("Dashboard Fehler:", e);
        setError(e?.message ?? "Fehler beim Laden der Termine.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session?.user?.email, status]);

  // Buchungen zu FullCalendar-Events mappen
  const events = bookings.map((b) => ({
    id: b.id,
    title:
      (b.student?.name || b.student?.email || "Termin") +
      (b.status === "pending" ? " (offen)" : ""),
    start: b.start,
    end: b.end,
    allDay: false,
  }));

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Lehrer-Dashboard</h1>

      {error && (
        <p className="text-red-600 mb-4">
          {error}
        </p>
      )}

      {loading && <p>Lade Kalender…</p>}

      {!loading && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          nowIndicator={true}
          height="auto"
        />
      )}
    </main>
  );
}
