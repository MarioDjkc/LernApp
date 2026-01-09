"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Offer = {
  id: string;
  schoolTrack: string;
  schoolForm: string;
  level: string;
  minGrade: number;
  maxGrade: number;
  subject: { id: string; name: string };
};

type Slot = {
  id: string;
  date: string;
  start: string;
  end: string;
  offerId?: string | null;
  offer?: Offer | null;
};

export default function TeacherAvailabilityPage() {
  const { data: session, status } = useSession();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [offerId, setOfferId] = useState<string>(""); // "" = nicht zugeordnet
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  async function loadAll() {
    if (!session?.user?.email) return;

    setLoading(true);
    setMsg(null);

    try {
      const [offRes, slotRes] = await Promise.all([
        fetch(`/api/teacher/offers?email=${encodeURIComponent(session.user.email)}`, { cache: "no-store" }),
        fetch(`/api/teacher/availability?email=${encodeURIComponent(session.user.email)}`, { cache: "no-store" }),
      ]);

      const offJson = await offRes.json().catch(() => ({}));
      const slotJson = await slotRes.json().catch(() => ({}));

      setOffers(offJson.data || []);
      setSlots(slotJson.data || []);
    } catch (e: any) {
      setMsg(e?.message || "Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") loadAll();
  }, [status]); // eslint-disable-line

  async function addSlot() {
    if (!session?.user?.email) return;
    setMsg(null);

    if (!date || !start || !end) {
      setMsg("Bitte Datum, Start und Ende ausfüllen.");
      return;
    }

    const res = await fetch("/api/teacher/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        date,
        start,
        end,
        offerId: offerId ? offerId : null,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || `Fehler ${res.status}`);
      return;
    }

    // ✅ ganz wichtig: danach neu laden, sonst bleibt Liste leer
    await loadAll();

    // optional reset
    setDate("");
    setStart("");
    setEnd("");

    setMsg("✅ Zeitfenster hinzugefügt");
  }

  async function removeSlot(id: string) {
    const res = await fetch("/api/teacher/availability/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || `Fehler ${res.status}`);
      return;
    }

    await loadAll();
  }

  function offerLabel(o: Offer) {
    const levelLabel = o.level === "UNTERSTUFE" ? "Unterstufe" : "Oberstufe";
    return `${o.subject.name} · ${o.schoolTrack} · ${o.schoolForm} · ${levelLabel} · ${o.minGrade}-${o.maxGrade}`;
  }

  if (status === "loading") return <main className="p-6">Lade…</main>;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Meine Verfügbarkeit</h1>

        {msg && (
          <p className={`mb-4 text-sm ${msg.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
            {msg}
          </p>
        )}

        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-8">
          <h2 className="font-semibold mb-4">Zeitfenster hinzufügen</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Für welches Angebot?</label>
              <select
                value={offerId}
                onChange={(e) => setOfferId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Für alle / nicht zugeordnet</option>
                {offers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {offerLabel(o)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1">Start</label>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Ende</label>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          <button
            onClick={addSlot}
            disabled={loading}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            Hinzufügen
          </button>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Eingetragene Zeiten</h2>

          {loading && <p className="text-gray-500">Lade…</p>}

          {!loading && slots.length === 0 && (
            <p className="text-gray-500">Noch keine Zeiten eingetragen.</p>
          )}

          <div className="space-y-3">
            {slots.map((s) => (
              <div key={s.id} className="flex items-center justify-between border rounded-xl p-4">
                <div className="space-y-1">
                  <div className="font-semibold">
                    {new Date(s.date).toLocaleDateString()} · {s.start} – {s.end}
                  </div>
                  <div className="text-sm text-gray-600">
                    Angebot:{" "}
                    {s.offer ? offerLabel(s.offer) : "Für alle / nicht zugeordnet"}
                  </div>
                </div>

                <button
                  onClick={() => removeSlot(s.id)}
                  className="text-red-600 hover:underline font-medium"
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
