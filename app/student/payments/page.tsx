"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Teacher = {
  id: string;
  name: string;
  subject: string;
};

type Booking = {
  id: string;
  start: string;
  end: string;
  priceCents: number;
  currency: string;
  status: string;
  note: string | null;
  teacher: Teacher;
};

type Rating = {
  teacherId: string;
  stars: number;
  comment: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:           { label: "Ausstehend",             color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  checkout_started:  { label: "Zahlung läuft",          color: "text-orange-600 bg-orange-50 border-orange-200" },
  confirmed:         { label: "Bestätigt",              color: "text-blue-600 bg-blue-50 border-blue-200" },
  paid:              { label: "Bezahlt",                color: "text-green-600 bg-green-50 border-green-200" },
  teacher_cancelled: { label: "Abgesagt (Lehrer)",      color: "text-red-600 bg-red-50 border-red-200" },
  payment_failed:    { label: "Zahlung fehlgeschlagen", color: "text-red-600 bg-red-50 border-red-200" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-AT", {
    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
}

function StarPicker({ value, onChange }: { value: number; onChange: (s: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className={`text-2xl transition ${s <= (hover || value) ? "text-amber-400" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RatingForm({ teacherId, teacherName, existing, onSaved }: {
  teacherId: string;
  teacherName: string;
  existing: Rating | null;
  onSaved: (r: Rating) => void;
}) {
  const [stars, setStars]     = useState(existing?.stars ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState<string | null>(null);
  const [open, setOpen]       = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stars) return;
    setSaving(true); setMsg(null);
    const res  = await fetch("/api/ratings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherId, stars, comment: comment.trim() || null }) });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg("Bewertung gespeichert.");
      onSaved({ teacherId, stars, comment: comment.trim() || null });
      setOpen(false);
    } else {
      setMsg(json?.error ?? "Fehler beim Speichern.");
    }
    setSaving(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2"
      >
        {existing ? `Bewertung ändern (${existing.stars}★)` : `${teacherName} bewerten`}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <p className="text-sm font-medium text-gray-700">{existing ? "Bewertung ändern" : `${teacherName} bewerten`}</p>
      <StarPicker value={stars} onChange={setStars} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Kommentar (optional)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none"
      />
      {msg && <p className={`text-xs ${msg.includes("Fehler") ? "text-red-600" : "text-green-700"}`}>{msg}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={!stars || saving} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50">
          {saving ? "Speichern..." : "Abgeben"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
          Abbrechen
        </button>
      </div>
    </form>
  );
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [ratings, setRatings]   = useState<Rating[]>([]);

  const successBookingId = searchParams.get("booking");
  const wasSuccess   = searchParams.get("success") === "1";
  const wasCancelled = searchParams.get("cancelled") === "1";

  useEffect(() => {
    fetch("/api/student/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const bks: Booking[] = json.bookings ?? [];
        setBookings(bks);

        // Load ratings for all teachers with paid bookings
        const paidTeacherIds = [...new Set(bks.filter((b) => b.status === "paid").map((b) => b.teacher.id))];
        Promise.all(
          paidTeacherIds.map((id) =>
            fetch(`/api/ratings?teacherId=${id}`, { cache: "no-store" })
              .then((r) => r.json())
              .catch(() => ({}))
          )
        ).then((results) => {
          const myRatings: Rating[] = [];
          results.forEach((r, i) => {
            // The ratings API returns all ratings; we need to identify our own.
            // We store per-teacherId from the ratings list (first entry is most recent).
            // Since the API returns all ratings and we upsert per student-teacher pair,
            // we track the teacherId we queried.
            if (r.myRating) {
              myRatings.push({ teacherId: paidTeacherIds[i], stars: r.myRating.stars, comment: r.myRating.comment });
            }
          });
          setRatings(myRatings);
        });
      })
      .catch(() => setError("Buchungen konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  async function handlePay(bookingId: string) {
    setPayingId(bookingId);
    try {
      const res  = await fetch("/api/student/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Fehler beim Starten der Zahlung");
      window.location.href = json.url;
    } catch (e: any) {
      setError(e?.message ?? "Unbekannter Fehler");
      setPayingId(null);
    }
  }

  function handleRatingSaved(r: Rating) {
    setRatings((prev) => {
      const without = prev.filter((x) => x.teacherId !== r.teacherId);
      return [...without, r];
    });
  }

  // Group bookings: show one rating form per teacher (not per booking)
  const ratedTeacherIds = new Set<string>();

  return (
    <main className="min-h-screen bg-[#f3f5fb] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payments</h1>

        {wasSuccess && successBookingId && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
            Zahlungsdaten erfolgreich gespeichert. Deine Buchung wird nach Lehrerbest&auml;tigung abgerechnet.
          </div>
        )}
        {wasCancelled && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            Zahlung abgebrochen. Du kannst es jederzeit erneut versuchen.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && <p className="text-gray-500">Lade Buchungen...</p>}
        {!loading && bookings.length === 0 && <p className="text-gray-500">Keine Buchungen vorhanden.</p>}

        <div className="space-y-4">
          {bookings.map((b) => {
            const statusInfo = STATUS_LABELS[b.status] ?? { label: b.status, color: "text-gray-600 bg-gray-50 border-gray-200" };
            const canPay = b.status === "pending";
            const isPaid = b.status === "paid";

            // Show rating form only on the first paid booking per teacher
            const showRating = isPaid && !ratedTeacherIds.has(b.teacher.id);
            if (isPaid) ratedTeacherIds.add(b.teacher.id);

            const existingRating = ratings.find((r) => r.teacherId === b.teacher.id) ?? null;

            return (
              <div key={b.id} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-semibold text-base">{b.teacher.name}</div>
                    <div className="text-sm text-gray-500 mb-1">{b.teacher.subject}</div>
                    <div className="text-sm text-gray-700">
                      {formatDate(b.start)} &middot; {formatTime(b.start)} &ndash; {formatTime(b.end)}
                    </div>
                    {b.note && <div className="text-xs text-gray-500 mt-1">Notiz: {b.note}</div>}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <div className="text-sm font-semibold">
                      {(b.priceCents / 100).toFixed(2)} {b.currency.toUpperCase()}
                    </div>
                    {canPay && (
                      <button
                        onClick={() => handlePay(b.id)}
                        disabled={payingId === b.id}
                        className="mt-1 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {payingId === b.id ? "Weiterleitung..." : "Jetzt zahlen"}
                      </button>
                    )}
                  </div>
                </div>

                {showRating && (
                  <RatingForm
                    teacherId={b.teacher.id}
                    teacherName={b.teacher.name}
                    existing={existingRating}
                    onSaved={handleRatingSaved}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-gray-500">Lade...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
