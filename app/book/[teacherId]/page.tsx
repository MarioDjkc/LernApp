// app/book/[teacherId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Teacher = {
  id: string | number;
  name: string;
  email?: string;
  subject: string;
};

export default function BookPage() {
  const router = useRouter();
  const rawPathname = usePathname(); // string | null
  const pathname = rawPathname ?? "";

  // teacherId aus der URL holen: /book/1 -> "1"
  const segments = pathname.split("/");
  const teacherId = segments[segments.length - 1] || "";

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Lehrer laden
  useEffect(() => {
    if (!teacherId) return;

    (async () => {
      try {
        const res = await fetch("/api/teachers");
        const json = await res.json();

        const list: Teacher[] = json.data ?? json;
        const found = list.find((t) => String(t.id) === String(teacherId));

        if (!found) {
          setError("Lehrer wurde nicht gefunden.");
        } else {
          setTeacher(found);
          setSubject(found.subject ?? "");
        }
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden des Lehrers.");
      } finally {
        setLoadingTeacher(false);
      }
    })();
  }, [teacherId]);

  function buildDateTime(dateStr: string, timeStr: string): string {
    // z.B. "2025-06-22" + "20:22" -> "2025-06-22T20:22:00"
    return `${dateStr}T${timeStr}:00`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teacher) return;

    setError(null);
    setSubmitting(true);

    try {
      const startsAt = buildDateTime(date, startTime);
      const endsAt = endTime ? buildDateTime(date, endTime) : null;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          studentName,
          studentEmail,
          subject,
          startDate: startsAt,
          endDate: endsAt,
          note,
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
      }, 1500);
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
    !date ||
    !startTime ||
    submitting;

  return (
    <main className="min-h-screen bg-[#f5f7fa] flex justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">
        {loadingTeacher && <p>Lade Lehrer…</p>}
        {!loadingTeacher && !teacher && (
          <p className="text-red-500">Lehrer wurde nicht gefunden.</p>
        )}

        {teacher && (
          <>
            <h1 className="text-2xl font-bold mb-2">
              Termin vereinbaren mit {teacher.name}
            </h1>
            <p className="text-gray-600 mb-6">
              Fach: <span className="font-medium">{teacher.subject}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Dein Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Deine E-Mail
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fach</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Startzeit
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Endzeit (optional)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notiz (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]"
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
                  <br />
                  Du wirst gleich zu deinem Dashboard weitergeleitet.
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
                  {submitting ? "Sende…" : "Termin anfragen"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
