// app/teacher/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

type StudentInfo = {
  id: string;
  name: string | null;
  email: string;
  schoolName: string | null;
  schoolTrack: "AHS" | "BHS" | null;
  schoolForm: string | null; // enum string
  level: "UNTERSTUFE" | "OBERSTUFE" | null;
  grade: number | null;
};

type Booking = {
  id: string;
  start: string;
  end: string;
  status: "pending" | "accepted" | "declined";
  note?: string | null;
  student?: StudentInfo | null;
};

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function labelLevel(level: StudentInfo["level"]) {
  if (!level) return "—";
  return level === "UNTERSTUFE" ? "Unterstufe" : "Oberstufe";
}

function labelTrack(track: StudentInfo["schoolTrack"]) {
  if (!track) return "—";
  return track;
}

const LABEL_FORM: Record<string, string> = {
  ALL: "Alle",
  AHS_GYMNASIUM: "Gymnasium / Klassisches Gymnasium",
  AHS_REALGYMNASIUM: "Realgymnasium",
  AHS_WK_REALGYMNASIUM: "Wirtschaftskundliches Realgymnasium",
  AHS_BORG: "BORG (Oberstufenrealgymnasium)",
  AHS_SCHWERPUNKT: "AHS mit Schwerpunkt",
  BHS_HTL: "HTL",
  BHS_HAK: "HAK",
  BHS_HLW: "HLW / HWS",
  BHS_MODE: "HLA Mode",
  BHS_KUNST_GESTALTUNG: "HLA Kunst & Gestaltung",
  BHS_TOURISMUS: "HLA Tourismus",
  BHS_SOZIALPAED: "Sozial-/Elementarpädagogik",
  BHS_LAND_FORST: "Land- & Forstwirtschaft",
};

function labelForm(form: string | null) {
  if (!form) return "—";
  return LABEL_FORM[form] || form;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------------
  // BUCHUNGEN LADEN
  // ------------------------------------------------------------------
  async function loadBookings() {
    if (!session?.user?.email) return;

    setLoading(true);
    const res = await fetch(`/api/bookings/teacher?email=${session.user.email}`, {
      cache: "no-store",
    });

    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }

  useEffect(() => {
    if (status === "authenticated") loadBookings();
  }, [status]);

  // ------------------------------------------------------------------
  // STATUS ÄNDERN
  // ------------------------------------------------------------------
  async function updateStatus(bookingId: string, newStatus: "accepted" | "declined") {
    await fetch("/api/bookings/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, status: newStatus }),
    });

    loadBookings();
  }

  // ------------------------------------------------------------------
  // EVENTS FÜR FULLCALENDAR
  // ------------------------------------------------------------------
  const events = bookings.map((b) => ({
    id: b.id,
    title:
      (b.student?.name || b.student?.email || "Termin") +
      (b.status === "pending"
        ? " (offen)"
        : b.status === "accepted"
        ? " (angenommen)"
        : " (abgelehnt)"),
    start: b.start,
    end: b.end,
    backgroundColor:
      b.status === "pending"
        ? "#3b82f6"
        : b.status === "accepted"
        ? "#16a34a"
        : "#dc2626",
  }));

  // ------------------------------------------------------------------
  // TERMIN KLICK
  // ------------------------------------------------------------------
  function onEventClick(info: any) {
    const booking = bookings.find((b) => b.id === info.event.id);
    if (!booking) return;

    const student = booking.student || null;

    const noteText = booking.note?.trim()
      ? escapeHtml(booking.note.trim())
      : "—";

    const studentName = escapeHtml(student?.name || "—");
    const studentEmail = escapeHtml(student?.email || "—");
    const schoolName = escapeHtml(student?.schoolName || "—");
    const schoolTrack = escapeHtml(labelTrack(student?.schoolTrack || null));
    const schoolForm = escapeHtml(labelForm(student?.schoolForm || null));
    const schoolLevel = escapeHtml(labelLevel(student?.level || null));
    const grade = student?.grade ? String(student.grade) : "—";

    const dialog = document.createElement("div");
    dialog.className =
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4";

    dialog.innerHTML = `
      <div class="bg-white p-6 rounded-xl max-w-md w-full">
        <h2 class="text-xl font-bold mb-3">Termin verwalten</h2>

        <div style="margin-bottom:10px;">
          <p><strong>Schüler:</strong> ${studentName}</p>
          <p><strong>E-Mail:</strong> ${studentEmail}</p>
          <p><strong>Schule:</strong> ${schoolName}</p>
          <p><strong>Schultyp:</strong> ${schoolTrack}</p>
          <p><strong>Schulform:</strong> ${schoolForm}</p>
          <p><strong>Stufe:</strong> ${schoolLevel}</p>
          <p><strong>Klasse:</strong> ${escapeHtml(grade)}</p>
        </div>

        <p><strong>Datum:</strong> ${new Date(booking.start).toLocaleDateString()}</p>
        <p><strong>Zeit:</strong> ${new Date(booking.start).toLocaleTimeString()} – ${new Date(
          booking.end
        ).toLocaleTimeString()}</p>

        <div style="margin-top:12px; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">
          <p style="font-weight:700; margin-bottom:6px;">Notiz des Schülers:</p>
          <p style="white-space:pre-wrap;">${noteText}</p>
        </div>

        <div class="flex gap-3 mt-6">
          <button id="acceptBtn" class="flex-1 bg-green-600 text-white py-2 rounded-lg">
            Annehmen
          </button>
          <button id="declineBtn" class="flex-1 bg-red-600 text-white py-2 rounded-lg">
            Ablehnen
          </button>
        </div>

        <button id="closeBtn" class="mt-4 w-full py-2 text-gray-600">
          Abbrechen
        </button>
      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector("#acceptBtn")!.onclick = async () => {
      await updateStatus(booking.id, "accepted");
      dialog.remove();
    };

    dialog.querySelector("#declineBtn")!.onclick = async () => {
      await updateStatus(booking.id, "declined");
      dialog.remove();
    };

    dialog.querySelector("#closeBtn")!.onclick = () => dialog.remove();
  }

  // ------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Mein Kalender</h1>

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
          eventClick={onEventClick}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          nowIndicator
          height="auto"
        />
      )}
    </main>
  );
}
