"use client";

import { useEffect, useState } from "react";

type TeacherMini = {
  id: string;
  name: string;
  subject: string;
};

export default function BookingModal({
  open,
  onClose,
  teacher,
}: {
  open: boolean;
  onClose: () => void;
  teacher: TeacherMini | null;
}) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit =
    open && !!teacher && !!date && !!time && !!name && !!email && !loading;

  // Reset bei Schließen
  useEffect(() => {
    if (!open) {
      setDate("");
      setSlots([]);
      setTime("");
      setName("");
      setEmail("");
      setNote("");
      setErr(null);
    }
  }, [open]);

  // Verfügbarkeiten laden, wenn Datum + Lehrer vorhanden
  useEffect(() => {
    (async () => {
      if (!open || !teacher || !date) {
        setSlots([]);
        setTime("");
        return;
      }
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(
          `/api/teachers/${teacher.id}/availability?date=${date}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Fehler beim Laden");
        setSlots(Array.isArray(json.slots) ? json.slots : []);
        setTime("");
      } catch (e: any) {
        setErr(e?.message ?? "Konnte Verfügbarkeiten nicht laden.");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, teacher?.id, date]);

  async function handleSubmit() {
    if (!canSubmit || !teacher) return;
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          name,
          email,
          date, // YYYY-MM-DD
          time, // HH:MM
          note,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Fehler beim Speichern");
      }

      // Chat automatisch öffnen & Nachricht vorfüllen (keine Alerts/Logs)
      const text =
        `Hallo ${teacher.name}, ich habe soeben einen Termin angefragt:\n` +
        `📅 ${date} um ${time}\n` +
        `Name: ${name}, E-Mail: ${email}\n` +
        `Bitte bestätige den Termin. Danke!`;

      window.dispatchEvent(new CustomEvent("open-chat"));
      window.dispatchEvent(
        new CustomEvent("chat:prefill", {
          detail: {
            text,
            teacher: {
              id: teacher.id,
              name: teacher.name,
              subject: teacher.subject,
            },
          },
        })
      );

      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  if (!open || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-6">
        {/* Kopf */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Termin bei {teacher.name} vereinbaren
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        {/* Inhalt */}
        <div className="space-y-4">
          {/* Datum */}
          <div>
            <label className="block text-sm font-medium mb-1">Datum</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Uhrzeit */}
          <div>
            <label className="block text-sm font-medium mb-1">Uhrzeit</label>
            {!date ? (
              <div className="text-sm text-gray-500">
                Bitte zuerst das Datum wählen.
              </div>
            ) : loading ? (
              <div className="text-sm text-gray-500">Lade freie Zeiten…</div>
            ) : slots.length === 0 ? (
              <div className="text-sm text-gray-500">
                An diesem Tag sind keine Zeiten frei.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTime(s)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${
                      time === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-800 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Dein Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Max Mustermann"
            />
          </div>

          {/* E-Mail */}
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="max@mail.com"
            />
          </div>

          {/* Notiz */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notiz (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="z. B. Thema, Prüfungsdatum …"
            />
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          {/* Aktionen */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {loading ? "Speichere…" : "Termin anfragen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
