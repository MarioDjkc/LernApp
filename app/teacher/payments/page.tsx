"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string | null;
  email: string;
};

type Booking = {
  id: string;
  start: string;
  end: string;
  priceCents: number;
  currency: string;
  status: string;
  note: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  student: Student;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:              { label: "Ausstehend",             color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  checkout_started:     { label: "Zahlung läuft",          color: "text-orange-700 bg-orange-50 border-orange-200" },
  payment_method_saved: { label: "Karte gespeichert",      color: "text-blue-700 bg-blue-50 border-blue-200" },
  confirmed:            { label: "Bestätigt",              color: "text-blue-700 bg-blue-50 border-blue-200" },
  accepted:             { label: "Angenommen",             color: "text-green-700 bg-green-50 border-green-200" },
  paid:                 { label: "Bezahlt",                color: "text-green-700 bg-green-50 border-green-200" },
  declined:             { label: "Abgelehnt",              color: "text-red-700 bg-red-50 border-red-200" },
  teacher_cancelled:    { label: "Abgesagt",               color: "text-red-700 bg-red-50 border-red-200" },
  payment_failed:       { label: "Zahlung fehlgeschlagen", color: "text-red-700 bg-red-50 border-red-200" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-AT", {
    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-AT", {
    hour: "2-digit", minute: "2-digit",
  });
}

// Statistiken berechnen
function calcStats(bookings: Booking[]) {
  const total = bookings.length;
  const paid = bookings.filter((b) => b.status === "paid").length;
  const pending = bookings.filter((b) =>
    ["pending", "checkout_started", "payment_method_saved", "confirmed", "accepted"].includes(b.status)
  ).length;
  const failed = bookings.filter((b) =>
    ["payment_failed", "declined", "teacher_cancelled"].includes(b.status)
  ).length;
  const totalRevenue = bookings
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.priceCents, 0);

  return { total, paid, pending, failed, totalRevenue };
}

export default function TeacherPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "failed">("all");

  useEffect(() => {
    fetch("/api/teacher/payments", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setBookings(json.bookings ?? []))
      .catch(() => setError("Buchungen konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  const stats = calcStats(bookings);

  const filtered = bookings.filter((b) => {
    if (filter === "paid") return b.status === "paid";
    if (filter === "pending") return ["pending", "checkout_started", "payment_method_saved", "confirmed", "accepted"].includes(b.status);
    if (filter === "failed") return ["payment_failed", "declined", "teacher_cancelled"].includes(b.status);
    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Payments</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* STATISTIKEN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-1">Gesamt</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-1">Bezahlt</div>
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-1">Ausstehend</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-1">Einnahmen</div>
          <div className="text-2xl font-bold text-blue-600">
            {(stats.totalRevenue / 100).toFixed(2)} EUR
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "paid", "pending", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              filter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
            }`}
          >
            {f === "all" ? "Alle" : f === "paid" ? "Bezahlt" : f === "pending" ? "Ausstehend" : "Fehlgeschlagen"}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Lade Buchungen...</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-gray-500">Keine Buchungen gefunden.</p>
      )}

      {/* LISTE */}
      <div className="space-y-3">
        {filtered.map((b) => {
          const statusInfo = STATUS_LABELS[b.status] ?? {
            label: b.status,
            color: "text-gray-600 bg-gray-50 border-gray-200",
          };

          return (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Schüler + Termin */}
                <div>
                  <div className="font-semibold text-base">
                    {b.student.name || b.student.email}
                  </div>
                  <div className="text-sm text-gray-500">{b.student.email}</div>
                  <div className="text-sm text-gray-700 mt-1">
                    {formatDate(b.start)} &middot; {formatTime(b.start)} &ndash; {formatTime(b.end)}
                  </div>
                  {b.note && (
                    <div className="text-xs text-gray-500 mt-1">Notiz: {b.note}</div>
                  )}
                </div>

                {/* Status + Betrag */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <div className="text-sm font-semibold">
                    {(b.priceCents / 100).toFixed(2)} {b.currency.toUpperCase()}
                  </div>
                  {b.stripePaymentIntentId && (
                    <div className="text-xs text-gray-400 font-mono">
                      {b.stripePaymentIntentId.slice(0, 20)}…
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
