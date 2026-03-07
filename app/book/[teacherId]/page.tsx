"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const PRICE_PER_HOUR = 33; // Euro

import Image from "next/image";

type Teacher = {
  id: string;
  name: string;
  subject: string;
  profilePicture?: string | null;
  description?: string | null;
  avgRating?: number | null;
  ratingCount?: number;
};

type RatingItem = {
  id: string;
  stars: number;
  comment: string | null;
  createdAt: string;
  student: { name: string | null };
};

type BlockedPeriod = {
  id: string;
  fromDate: string;
  toDate: string;
  note: string | null;
};

type BookedSlot = {
  start: string; // "HH:MM"
  end: string;
};

function parseSubjects(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function isDateBlocked(dateStr: string, periods: BlockedPeriod[]): boolean {
  const d = new Date(dateStr);
  d.setHours(12, 0, 0, 0);
  return periods.some((p) => {
    const from = new Date(p.fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(p.toDate);
    to.setHours(23, 59, 59, 999);
    return d >= from && d <= to;
  });
}

function calcHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(0, minutes / 60);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isTimeOverlapping(
  start: string,
  end: string,
  booked: BookedSlot[]
): BookedSlot | null {
  if (!start || !end) return null;
  const s = toMinutes(start);
  const e = toMinutes(end);
  return (
    booked.find((b) => {
      const bs = toMinutes(b.start);
      const be = toMinutes(b.end);
      return s < be && e > bs;
    }) ?? null
  );
}

export default function BookPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const teacherId = pathname.split("/").at(-1) ?? "";

  const { data: session, status: authStatus } = useSession();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");

  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [canRate, setCanRate] = useState(false);
  const [myRating, setMyRating] = useState<{ stars: number; comment: string } | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingMsg, setRatingMsg] = useState<string | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill student data from session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !studentName) setStudentName(session.user.name);
      if (session.user.email && !studentEmail) setStudentEmail(session.user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Load teacher (detailed)
  useEffect(() => {
    if (!teacherId) return;
    (async () => {
      setLoadingTeacher(true);
      try {
        const res = await fetch(`/api/teachers/${teacherId}`, { cache: "no-store" });
        const json = await res.json();
        const found: Teacher = json.data ?? null;
        setTeacher(found);
        const subs = parseSubjects(found?.subject);
        if (subs.length > 0) setSelectedSubject(subs[0]);
        setRatings(json.data?.ratings ?? []);
      } catch {
        setError("Lehrer konnte nicht geladen werden.");
      } finally {
        setLoadingTeacher(false);
      }
    })();
  }, [teacherId]);

  // Check if student can rate (has paid booking) + load own rating
  useEffect(() => {
    if (!teacherId || !session?.user?.email) return;
    (async () => {
      try {
        const [bookRes, ratRes] = await Promise.all([
          fetch(`/api/bookings/student`, { cache: "no-store" }),
          fetch(`/api/ratings?teacherId=${teacherId}`, { cache: "no-store" }),
        ]);
        const bookJson = await bookRes.json().catch(() => ({}));
        const hasPaid = (bookJson.bookings ?? []).some(
          (b: { teacherId: string; status: string }) =>
            b.teacherId === teacherId && b.status === "paid"
        );
        setCanRate(hasPaid);

        const ratJson = await ratRes.json().catch(() => ({}));
        setRatings(ratJson.ratings ?? []);
        const studentEmail = session.user!.email!.toLowerCase();
        // find own rating by matching student name is too fragile; just show the form always if canRate
        void studentEmail;
      } catch {
        // non-critical
      }
    })();
  }, [teacherId, session]);

  // Load blocked dates
  useEffect(() => {
    if (!teacherId) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/student/teacher-blocked-dates?teacherId=${encodeURIComponent(teacherId)}`,
          { cache: "no-store" }
        );
        const json = await res.json().catch(() => ({}));
        setBlockedPeriods(json.periods || []);
      } catch {
        // non-critical
      }
    })();
  }, [teacherId]);

  // Load already-booked slots whenever date changes
  useEffect(() => {
    if (!teacherId || !selectedDate) {
      setBookedSlots([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `/api/student/teacher-booked-slots?teacherId=${encodeURIComponent(teacherId)}&date=${selectedDate}`,
          { cache: "no-store" }
        );
        const json = await res.json().catch(() => ({}));
        setBookedSlots(json.slots || []);
      } catch {
        // non-critical
      }
    })();
  }, [teacherId, selectedDate]);

  const subjects = useMemo(() => parseSubjects(teacher?.subject), [teacher]);

  const hours = useMemo(
    () => calcHours(startTime, endTime),
    [startTime, endTime]
  );

  const priceCents = Math.round(hours * PRICE_PER_HOUR * 100);
  const priceFormatted = (priceCents / 100).toFixed(2).replace(".", ",");

  const dateBlocked = selectedDate ? isDateBlocked(selectedDate, blockedPeriods) : false;

  const timeValid = hours > 0 && startTime < endTime;

  const overlappingSlot = timeValid
    ? isTimeOverlapping(startTime, endTime, bookedSlots)
    : null;

  const canSubmit =
    !!teacher &&
    !!studentName.trim() &&
    !!studentEmail.trim() &&
    !!selectedSubject &&
    !!selectedDate &&
    !dateBlocked &&
    timeValid &&
    !overlappingSlot &&
    !submitting;

  async function submitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingStars || !teacherId) return;
    setRatingSubmitting(true);
    setRatingMsg(null);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, stars: ratingStars, comment: ratingComment.trim() || null }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setRatingMsg("Bewertung gespeichert.");
      setMyRating({ stars: ratingStars, comment: ratingComment.trim() });
      // refresh ratings
      const ratRes = await fetch(`/api/ratings?teacherId=${teacherId}`, { cache: "no-store" });
      const ratJson = await ratRes.json().catch(() => ({}));
      setRatings(ratJson.ratings ?? []);
    } else {
      setRatingMsg(json?.error ?? "Fehler beim Speichern.");
    }
    setRatingSubmitting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teacher || !canSubmit) return;
    setError(null);
    setSubmitting(true);

    try {
      const start = `${selectedDate}T${startTime}:00`;
      const end = `${selectedDate}T${endTime}:00`;

      // 1) Create booking
      const bookRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim().toLowerCase(),
          start,
          end,
          note: note.trim() || null,
        }),
      });

      const bookJson = await bookRes.json().catch(() => ({}));
      if (!bookRes.ok) throw new Error(bookJson?.error || `Fehler ${bookRes.status}`);

      const bookingId = bookJson.booking?.id;
      if (!bookingId) throw new Error("Keine Buchungs-ID erhalten.");

      // 2) Start Stripe checkout
      const checkoutRes = await fetch("/api/student/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const checkoutJson = await checkoutRes.json().catch(() => ({}));
      if (!checkoutRes.ok) throw new Error(checkoutJson?.error || `Fehler ${checkoutRes.status}`);

      window.location.href = checkoutJson.url;
    } catch (e: any) {
      setError(e?.message ?? "Unbekannter Fehler.");
      setSubmitting(false);
    }
  }

  if (authStatus === "loading" || loadingTeacher) {
    return (
      <main className="min-h-screen bg-[#f5f7fa] flex justify-center items-center">
        <p className="text-gray-500">Lade...</p>
      </main>
    );
  }

  if (!teacher) {
    return (
      <main className="min-h-screen bg-[#f5f7fa] flex justify-center items-center">
        <p className="text-red-500">Lehrer nicht gefunden.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] flex justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
        {/* Teacher info header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
            {teacher.profilePicture ? (
              <Image src={teacher.profilePicture} alt={teacher.name} fill className="object-cover" />
            ) : null}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{teacher.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {teacher.avgRating != null ? (
                <span className="text-amber-400">
                  {Array.from({ length: 5 }, (_, i) => i < Math.round(teacher.avgRating!) ? "★" : "☆").join("")}
                </span>
              ) : null}
              {teacher.avgRating != null && (
                <span className="text-sm text-gray-500">
                  {teacher.avgRating.toFixed(1)} ({teacher.ratingCount ?? ratings.length} Bewertungen)
                </span>
              )}
            </div>
          </div>
        </div>

        {teacher.description && (
          <div className="bg-gray-50 border rounded-xl px-4 py-3 mb-6 text-sm text-gray-700 whitespace-pre-wrap">
            {teacher.description}
          </div>
        )}

        <p className="text-gray-500 mb-6 text-sm">
          1 Stunde = {PRICE_PER_HOUR} &euro; &middot; Mindestbuchung: 30 Minuten
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-1">Fach</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="" disabled>
                Bitte wahlen...
              </option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Datum</label>
            <input
              type="date"
              value={selectedDate}
              min={todayISO()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                dateBlocked ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              required
            />
            {dateBlocked && (
              <p className="text-red-600 text-sm mt-1">
                Dieser Tag ist nicht verfugbar (Lehrer abwesend).
              </p>
            )}
          </div>

          {/* Time range */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Von</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    overlappingSlot ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bis</label>
                <input
                  type="time"
                  value={endTime}
                  min={startTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    overlappingSlot ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Show already-booked slots for this day */}
            {selectedDate && bookedSlots.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Bereits gebucht:</span>{" "}
                {bookedSlots.map((s) => `${s.start}–${s.end}`).join(", ")}
              </div>
            )}

            {overlappingSlot && (
              <p className="text-red-600 text-sm mt-1">
                Dieser Zeitraum uberschneidet sich mit einer bestehenden Buchung ({overlappingSlot.start}–{overlappingSlot.end}).
              </p>
            )}
          </div>

          {/* Cost preview */}
          {hours > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {hours.toFixed(1).replace(".", ",")} Std. &times; {PRICE_PER_HOUR} &euro;
              </span>
              <span className="font-bold text-blue-900 text-lg">
                {priceFormatted} &euro;
              </span>
            </div>
          )}
          {startTime && endTime && !timeValid && (
            <p className="text-red-600 text-sm">
              Das Endzeitpunkt muss nach dem Startzeitpunkt liegen.
            </p>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Was mochtest du lernen? (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]"
              placeholder="z.B. Ich verstehe Integralrechnung nicht..."
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm whitespace-pre-line">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
            >
              {submitting ? "Bitte warten..." : `Jetzt buchen${hours > 0 ? ` — ${priceFormatted} €` : ""}`}
            </button>
          </div>
        </form>

        {/* Ratings list */}
        {ratings.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h2 className="font-semibold text-lg mb-3">Bewertungen</h2>
            <div className="space-y-3">
              {ratings.map((r) => (
                <div key={r.id} className="bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400">
                      {Array.from({ length: 5 }, (_, i) => i < r.stars ? "★" : "☆").join("")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {r.student?.name ?? "Schuler"} &middot;{" "}
                      {new Date(r.createdAt).toLocaleDateString("de-AT")}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating form — only if student has a paid booking with this teacher */}
        {canRate && (
          <div className="mt-8 pt-6 border-t">
            <h2 className="font-semibold text-lg mb-3">
              {myRating ? "Deine Bewertung andern" : "Lehrer bewerten"}
            </h2>
            <form onSubmit={submitRating} className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRatingStars(s)}
                    className={`text-3xl transition ${s <= ratingStars ? "text-amber-400" : "text-gray-300 hover:text-amber-200"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Kommentar (optional)"
                className="w-full border rounded-lg px-3 py-2 text-sm min-h-[70px]"
              />
              {ratingMsg && (
                <p className={`text-sm ${ratingMsg.includes("Fehler") || ratingMsg.includes("kannst") ? "text-red-600" : "text-green-700"}`}>
                  {ratingMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={ratingStars === 0 || ratingSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {ratingSubmitting ? "Speichern..." : "Bewertung abgeben"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
