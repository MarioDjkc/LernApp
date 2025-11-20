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

  // --- BUCHUNGEN LADEN ---
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      setError("Nicht eingeloggt.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch(
          `/api/bookings/teacher?teacherId=${session.user.id}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Fehler beim Laden");
        }

        setBookings(data.bookings || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session?.user?.id, status]);

  // --- EVENTS ERSTELLEN ---
  const events = bookings.map((b) => ({
    id: b.id,
    title:
      (b.student?.name || b.student?.email || "Termin") +
      (b.status === "pending" ? " (offen)" : ""),
    start: b.start,
    end: b.end,
    allDay: false,              // ⬅⬅⬅ WICHTIG!!!
    display: "block",
  }));

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Lehrer-Dashboard</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

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
          height="auto"
          nowIndicator={true}
          eventContent={(arg) => {
            return {
              html: `
                <div style="padding:4px; font-size:13px;">
                  <b>${arg.timeText}</b> ${arg.event.title}
                </div>
              `,
            };
          }}
        />
      )}
    </main>
  );
}
