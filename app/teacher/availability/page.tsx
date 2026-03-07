"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type UnavailabilityPeriod = {
  id: string;
  fromDate: string;
  toDate: string;
  note: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function TeacherAvailabilityPage() {
  const { data: session, status } = useSession();

  const [periods, setPeriods] = useState<UnavailabilityPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadPeriods() {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const email = encodeURIComponent(session.user.email);
      const res = await fetch(`/api/teacher/unavailability?email=${email}`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      setPeriods(json.data || []);
    } catch {
      setMsg("Fehler beim Laden der Zeitraume.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") loadPeriods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function addPeriod() {
    if (!session?.user?.email) return;
    if (!fromDate || !toDate) {
      setMsg("Bitte Von- und Bis-Datum angeben.");
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      setMsg("Das Enddatum muss nach dem Startdatum liegen.");
      return;
    }

    setSaving(true);
    setMsg(null);

    const res = await fetch("/api/teacher/unavailability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        fromDate,
        toDate,
        note: note.trim() || null,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || `Fehler ${res.status}`);
    } else {
      setMsg("Zeitraum gespeichert.");
      setFromDate("");
      setToDate("");
      setNote("");
      await loadPeriods();
    }
    setSaving(false);
  }

  async function deletePeriod(id: string) {
    if (!session?.user?.email) return;
    if (!confirm("Zeitraum wirklich loschen?")) return;

    setMsg(null);
    const email = encodeURIComponent(session.user.email);
    const res = await fetch(
      `/api/teacher/unavailability/${encodeURIComponent(id)}?email=${email}`,
      { method: "DELETE" }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || `Fehler ${res.status}`);
    } else {
      setMsg("Zeitraum geloscht.");
      await loadPeriods();
    }
  }

  if (status === "loading") {
    return <main className="min-h-screen bg-gray-50 px-6 py-10">Lade...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Verfugbarkeit</h1>
        <p className="text-gray-600 mb-8">
          Du bist grundsatzlich jeden Tag verfugbar. Trage hier ein, wann du{" "}
          <strong>nicht</strong> erreichbar bist (z.B. Urlaub, Krankheit).
        </p>

        {msg && (
          <p
            className={`mb-4 text-sm ${
              msg.includes("Fehler") ? "text-red-600" : "text-green-700"
            }`}
          >
            {msg}
          </p>
        )}

        {/* Formular */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">Nicht verfugbar von ... bis ...</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Von</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bis</label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Grund (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="z.B. Urlaub, Schulwoche..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <button
            onClick={addPeriod}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            {saving ? "Speichern..." : "Eintragen"}
          </button>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Eingetragene Abwesenheiten</h2>

          {loading && <p className="text-gray-500">Lade...</p>}
          {!loading && periods.length === 0 && (
            <p className="text-gray-500">Keine Abwesenheiten eingetragen — du bist immer verfugbar.</p>
          )}

          <div className="space-y-3">
            {periods.map((p) => (
              <div
                key={p.id}
                className="border rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-semibold">
                    {formatDate(p.fromDate)} &ndash; {formatDate(p.toDate)}
                  </div>
                  {p.note && (
                    <div className="text-sm text-gray-500 mt-0.5">{p.note}</div>
                  )}
                </div>
                <button
                  onClick={() => deletePeriod(p.id)}
                  className="text-red-600 hover:underline text-sm font-medium shrink-0"
                >
                  Loschen
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
