"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Teacher = {
  id: string;
  name: string;
  subject: string; // bei dir: "Englisch,Mathematik"
};

type Slot = {
  id: string;
  date: string;
  start: string;
  end: string;
  subject?: string | null; // "ALL" oder Fach
};

function parseSubjects(subjectRaw: string | null | undefined): string[] {
  if (!subjectRaw) return [];
  return subjectRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function BookPage() {
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "";

  const segments = pathname.split("/");
  const teacherId = segments[segments.length - 1] || "";

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [note, setNote] = useState("");

  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) || null,
    [slots, selectedSlotId]
  );

  // 1) Lehrer laden
  useEffect(() => {
    if (!teacherId) return;

    (async () => {
      try {
        setError(null);
        setLoadingTeacher(true);

        const res = await fetch("/api/teachers", { cache: "no-store" });
        const json = await res.json();

        const list: Teacher[] = json.data ?? json;
        const found = list.find((t) => String(t.id) === String(teacherId));

        if (!found) {
          setError("Lehrer wurde nicht gefunden.");
          setTeacher(null);
          return;
        }

        setTeacher(found);

        const subs = parseSubjects(found.subject);
        setSubjects(subs);

        // Default: erstes Fach auswählen (wenn vorhanden)
        if (subs.length > 0) {
          setSelectedSubject(subs[0]);
        } else {
          setSelectedSubject("");
        }
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden des Lehrers.");
      } finally {
        setLoadingTeacher(false);
      }
    })();
  }, [teacherId]);

  // 2) Slots laden (abhängig vom ausgewählten Fach)
  useEffect(() => {
    if (!teacherId) return;
    if (!selectedSubject) {
      setSlots([]);
      setSelectedSlotId("");
      return;
    }

    (async () => {
      try {
        setError(null);

        const res = await fetch(
          `/api/student/availability?teacherId=${encodeURIComponent(
            teacherId
          )}&subject=${encodeURIComponent(selectedSubject)}`,
          { cache: "no-store" }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Slots konnten nicht geladen werden.");

        // subjects kommt auch vom Backend – wir nehmen sie als “Quelle der Wahrheit”
        if (Array.isArray(data.subjects)) {
          setSubjects(data.subjects);
          if (!data.subjects.includes(selectedSubject) && data.subjects.length > 0) {
            setSelectedSubject(data.subjects[0]);
          }
        }

        setSlots(data.slots || []);
        setSelectedSlotId("");
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden der Slots.");
        setSlots([]);
        setSelectedSlotId("");
      }
    })();
  }, [teacherId, selectedSubject]);

  function buildDateTime(dateStr: string, timeStr: string): string {
    return `${dateStr}T${timeStr}:00`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teacher) return;
    if (!selectedSlot) {
      setError("Bitte wähle einen freien Termin aus.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Slot enthält date als DateTime in DB -> wir nehmen nur das Datum (YYYY-MM-DD)
      const dateOnly = new Date(selectedSlot.date).toISOString().slice(0, 10);

      const startsAt = buildDateTime(dateOnly, selectedSlot.start);
      const endsAt = buildDateTime(dateOnly, selectedSlot.end);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          studentName,
          studentEmail,
          subject: selectedSubject, // ✅ genau das gewählte Fach
          start: startsAt,
          end: endsAt,
          note,
          availabilityId: selectedSlot.id, // falls du das nutzt
        }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        throw new Error(json?.error || `Fehler bei der Terminbuchung (${res.status})`);
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/student/dashboard");
      }, 1200);
    } catch (e: any) {
      setError(e?.message ?? "Unbekannter Fehler bei der Buchung.");
    } finally {
      setSubmitting(false);
    }
  }

  const disabled =
    !teacher ||
    !studentName ||
    !studentEmail ||
    !selectedSubject ||
    !selectedSlotId ||
    submitting;

  return (
    <main className="min-h-screen bg-[#f5f7fa] flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-10">
        {loadingTeacher && <p>Lade Lehrer…</p>}

        {!loadingTeacher && !teacher && (
          <p className="text-red-500">Lehrer wurde nicht gefunden.</p>
        )}

        {teacher && (
          <>
            <h1 className="text-4xl font-extrabold mb-2">
              Termin mit {teacher.name}
            </h1>

            <p className="text-gray-600 mb-6">
              <span className="font-semibold">Fächer:</span>{" "}
              {subjects.length ? subjects.join(", ") : "—"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Dein Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deine E-Mail</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* ✅ Fach wählen */}
              <div>
                <label className="block text-sm font-medium mb-1">Fach wählen</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="" disabled>
                    Bitte auswählen…
                  </option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ Freie Termine */}
              <div>
                <label className="block text-sm font-medium mb-2">Freie Termine</label>

                {slots.length === 0 ? (
                  <p className="text-gray-500">Keine freien Termine verfügbar.</p>
                ) : (
                  <select
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="" disabled>
                      Termin auswählen…
                    </option>
                    {slots.map((slot) => {
                      const d = new Date(slot.date).toLocaleDateString("de-DE");
                      return (
                        <option key={slot.id} value={slot.id}>
                          {d} — {slot.start} bis {slot.end}
                          {slot.subject && slot.subject !== "ALL"
                            ? ` (${slot.subject})`
                            : " (alle Fächer)"}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notiz (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[90px]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 whitespace-pre-line">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-600">
                  Termin erfolgreich angefragt 🎉
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={disabled}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                  {submitting ? "Sende…" : "Termin buchen"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
