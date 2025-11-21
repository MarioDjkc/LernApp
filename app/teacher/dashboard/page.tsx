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

  // ================================
  // 📌 STATUS-UPDATE FUNKTION
  // ================================
  async function handleStatusUpdate(
    bookingId: string,
    newStatus: "accepted" | "declined"
  ) {
    try {
      await fetch("/api/bookings/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: newStatus }),
      });

      // nach Update neu laden
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
    } catch (error) {
      console.error("Status Update Fehler:", error);
    }
  }

  // ================================
  // 📌 LEHRER TERMINE LADEN
  // ================================
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.email) {
      setError("Kein Lehrer eingeloggt (E-Mail fehlt in Session).");
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

        setBookings(data.bookings || []);
      } catch (e: any) {
        console.error("Dashboard Fehler:", e);
        setError(e?.message ?? "Fehler beim Laden.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session?.user?.email, status]);

  // ================================
  // 📌 EVENTS FÜR FULLCALENDAR
  // ================================
  const events = bookings.map((b) => ({
    id: b.id,
    title:
      (b.student?.name || b.student?.email || "Termin") +
      (b.status === "pending" ? " (offen)" : ""),
    start: b.start,
    end: b.end,
    allDay: false,
    extendedProps: b, // wichtig!
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
          nowIndicator={true}
          height="auto"
          // ===============================
          // 📌 TERMIN-INHALT IM KALENDER
          // ===============================
          eventContent={(info) => {
            const booking: Booking = info.event.extendedProps;

            return (
              <div className="p-2">
                <p className="font-semibold">
                  {booking.student?.name || booking.student?.email}
                </p>

                <p className="text-xs text-gray-600">
                  {new Date(booking.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(booking.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {/* Status Buttons */}
                {booking.status === "pending" && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() =>
                        handleStatusUpdate(booking.id, "accepted")
                      }
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                    >
                      Annehmen
                    </button>

                    <button
                      onClick={() =>
                        handleStatusUpdate(booking.id, "declined")
                      }
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                    >
                      Ablehnen
                    </button>
                  </div>
                )}

                {booking.status === "accepted" && (
                  <p className="text-green-700 font-semibold text-xs mt-2">
                    ✔ Angenommen
                  </p>
                )}

                {booking.status === "declined" && (
                  <p className="text-red-700 font-semibold text-xs mt-2">
                    ✖ Abgelehnt
                  </p>
                )}
              </div>
            );
          }}
        />
      )}
    </main>
  );
}
