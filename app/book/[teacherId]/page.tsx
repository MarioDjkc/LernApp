"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Teacher = {
  id: string;
  name: string;
  subject: string;
};

type Slot = {
  id: string;
  date: string;
  start: string;
  end: string;
};

export default function BookPage() {
  const router = useRouter();
  const pathname = usePathname();
  const teacherId = pathname.split("/").pop() || "";

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // -----------------------------
  // Lehrer laden
  // -----------------------------
  useEffect(() => {
    async function loadTeacher() {
      const res = await fetch("/api/teachers");
      const json = await res.json();
      const found = (json.data ?? json).find(
        (t: Teacher) => String(t.id) === String(teacherId)
      );
      setTeacher(found ?? null);
    }
    loadTeacher();
  }, [teacherId]);

  // -----------------------------
  // Slots laden
  // -----------------------------
  useEffect(() => {
    async function loadSlots() {
      const res = await fetch(
        `/api/student/availability?teacherId=${teacherId}`
      );
      const json = await res.json();
      setSlots(json.slots || []);
      setLoading(false);
    }
    loadSlots();
  }, [teacherId]);

  // -----------------------------
  // Buchen
  // -----------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityId: selectedSlot,
          studentName,
          studentEmail,
          note,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Fehler bei der Buchung");
      }

      // ✅ SLOT SOFORT ENTFERNEN
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlot));
      setSelectedSlot(null);
      setSuccess(true);

      setTimeout(() => {
        router.push("/student/dashboard");
      }, 1500);
    } catch (e: any) {
      setError(e?.message || "Unbekannter Fehler");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] flex justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8">
        {!teacher && <p>Lehrer wird geladen…</p>}

        {teacher && (
          <>
            <h1 className="text-2xl font-bold mb-2">
              Termin mit {teacher.name}
            </h1>
            <p className="text-gray-600 mb-6">
              Fach: <b>{teacher.subject}</b>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <input
                placeholder="Dein Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />

              {/* Email */}
              <input
                placeholder="Deine E-Mail"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />

              {/* Slots */}
              <div>
                <h3 className="font-semibold mb-2">Freie Termine</h3>

                {loading && <p>Lade Slots…</p>}

                {!loading && slots.length === 0 && (
                  <p className="text-gray-500">
                    Keine freien Termine verfügbar.
                  </p>
                )}

                <div className="space-y-2">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full border rounded-lg px-4 py-2 text-left ${
                        selectedSlot === slot.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300"
                      }`}
                    >
                      {new Date(slot.date).toLocaleDateString()} –{" "}
                      {slot.start} bis {slot.end}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notiz */}
              <textarea
                placeholder="Notiz (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && (
                <p className="text-green-600 text-sm">
                  Termin erfolgreich gebucht 🎉
                </p>
              )}

              <button
                type="submit"
                disabled={
                  submitting ||
                  !selectedSlot ||
                  !studentName ||
                  !studentEmail
                }
                className="w-full bg-blue-600 text-white rounded-lg py-2 disabled:opacity-50"
              >
                {submitting ? "Buche…" : "Termin buchen"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
