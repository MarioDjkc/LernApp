"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Offer = {
  id: string;
  schoolTrack: "AHS" | "BHS";
  schoolForm: string; // enum string, inkl "ALL"
  level: "UNTERSTUFE" | "OBERSTUFE";
  minGrade: number;
  maxGrade: number;
  subject: { id: string; name: string };
};

type Slot = {
  id: string;
  date: string;
  start: string;
  end: string;
  offerId: string | null;
  offer?: Offer | null;
};

const LABEL_FORM: Record<string, string> = {
  ALL: "Alle Schulformen",
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

function levelLabel(l: "UNTERSTUFE" | "OBERSTUFE") {
  return l === "UNTERSTUFE" ? "Unterstufe" : "Oberstufe";
}

function groupKey(o: Offer) {
  return `${o.subject.id}__${o.schoolTrack}__${o.level}__${o.minGrade}__${o.maxGrade}`;
}

function fullFormsForTrack(track: "AHS" | "BHS") {
  if (track === "AHS") {
    return new Set([
      "AHS_GYMNASIUM",
      "AHS_REALGYMNASIUM",
      "AHS_WK_REALGYMNASIUM",
      "AHS_BORG",
      "AHS_SCHWERPUNKT",
    ]);
  }
  return new Set([
    "BHS_HTL",
    "BHS_HAK",
    "BHS_HLW",
    "BHS_MODE",
    "BHS_KUNST_GESTALTUNG",
    "BHS_TOURISMUS",
    "BHS_SOZIALPAED",
    "BHS_LAND_FORST",
  ]);
}

type GroupedOfferOption =
  | { kind: "single"; value: string; label: string }
  | {
      kind: "groupAllForms";
      value: string; // "GROUP:<key>"
      label: string;
      meta: {
        subjectId: string;
        schoolTrack: "AHS" | "BHS";
        level: "UNTERSTUFE" | "OBERSTUFE";
        minGrade: number;
        maxGrade: number;
        existingAllOfferId?: string;
      };
    };

export default function TeacherAvailabilityPage() {
  const { data: session, status } = useSession();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [offerValue, setOfferValue] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  async function loadAll() {
    if (!session?.user?.email) return;
    setLoading(true);
    setMsg(null);

    try {
      const email = encodeURIComponent(session.user.email);

      const [offRes, slotRes] = await Promise.all([
        fetch(`/api/teacher/offers?email=${email}`, { cache: "no-store" }),
        fetch(`/api/teacher/availability?email=${email}`, { cache: "no-store" }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const offerOptions: GroupedOfferOption[] = useMemo(() => {
    const map = new Map<string, Offer[]>();
    for (const o of offers) {
      const k = groupKey(o);
      map.set(k, [...(map.get(k) || []), o]);
    }

    const result: GroupedOfferOption[] = [];

    for (const [k, list] of map.entries()) {
      const allOffer = list.find((x) => x.schoolForm === "ALL");

      if (allOffer) {
        result.push({
          kind: "single",
          value: allOffer.id,
          label: `${allOffer.subject.name} · ${allOffer.schoolTrack} · ${LABEL_FORM.ALL} · ${levelLabel(
            allOffer.level
          )} · ${allOffer.minGrade}-${allOffer.maxGrade}`,
        });
        continue;
      }

      const formsNeeded = fullFormsForTrack(list[0].schoolTrack);
      const formsHave = new Set(list.map((x) => x.schoolForm));
      const coversAll =
        list.length > 1 && [...formsNeeded].every((f) => formsHave.has(f));

      if (coversAll) {
        const any = list[0];
        result.push({
          kind: "groupAllForms",
          value: `GROUP:${k}`,
          label: `${any.subject.name} · ${any.schoolTrack} · ${LABEL_FORM.ALL} · ${levelLabel(
            any.level
          )} · ${any.minGrade}-${any.maxGrade}`,
          meta: {
            subjectId: any.subject.id,
            schoolTrack: any.schoolTrack,
            level: any.level,
            minGrade: any.minGrade,
            maxGrade: any.maxGrade,
          },
        });
      } else {
        for (const o of list) {
          result.push({
            kind: "single",
            value: o.id,
            label: `${o.subject.name} · ${o.schoolTrack} · ${
              LABEL_FORM[o.schoolForm] || o.schoolForm
            } · ${levelLabel(o.level)} · ${o.minGrade}-${o.maxGrade}`,
          });
        }
      }
    }

    result.sort((a, b) => a.label.localeCompare(b.label, "de"));
    return result;
  }, [offers]);

  async function ensureAllOffer(
    meta: NonNullable<
      Extract<GroupedOfferOption, { kind: "groupAllForms" }>["meta"]
    >
  ) {
    if (!session?.user?.email) return null;

    const res = await fetch("/api/teacher/offers/ensure-all-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        subjectId: meta.subjectId,
        schoolTrack: meta.schoolTrack,
        level: meta.level,
        minGrade: meta.minGrade,
        maxGrade: meta.maxGrade,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || `Fehler ${res.status}`);
    return json?.data?.id as string;
  }

  async function addSlot() {
    if (!session?.user?.email) return;
    setMsg(null);

    if (!date || !start || !end) {
      setMsg("Bitte Datum, Start und Ende eingeben.");
      return;
    }

    let finalOfferId: string | null = null;

    if (!offerValue) {
      finalOfferId = null;
    } else if (offerValue.startsWith("GROUP:")) {
      const opt = offerOptions.find((x) => x.value === offerValue);
      if (!opt || opt.kind !== "groupAllForms") {
        setMsg("Ungültige Auswahl.");
        return;
      }
      try {
        finalOfferId = await ensureAllOffer(opt.meta);
      } catch (e: any) {
        setMsg(e?.message || "Konnte ALL-Angebot nicht erstellen.");
        return;
      }
    } else {
      finalOfferId = offerValue;
    }

    const res = await fetch("/api/teacher/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        date,
        start,
        end,
        offerId: finalOfferId,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || `Fehler ${res.status}`);
      return;
    }

    setMsg("✅ Zeitfenster hinzugefügt");
    setDate("");
    setStart("");
    setEnd("");
    await loadAll();
  }

  // ✅ NEU: Slot löschen
  async function deleteSlot(slotId: string) {
    if (!session?.user?.email) return;

    const sure = confirm("Zeitfenster wirklich löschen?");
    if (!sure) return;

    setMsg(null);

    const res = await fetch(
      `/api/teacher/availability/${encodeURIComponent(slotId)}?email=${encodeURIComponent(
        session.user.email
      )}`,
      { method: "DELETE" }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || `Fehler ${res.status}`);
      return;
    }

    setMsg("✅ Zeitfenster gelöscht");
    await loadAll();
  }

  if (status === "loading") {
    return <main className="min-h-screen bg-gray-50 px-6 py-10">Lade…</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Meine Verfügbarkeit</h1>

        {msg && (
          <p
            className={`mb-4 text-sm ${
              msg.startsWith("✅") ? "text-green-700" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-10">
          <h2 className="font-semibold text-lg mb-4">Zeitfenster hinzufügen</h2>

          <label className="text-sm font-medium block mb-2">
            Für welches Angebot?
          </label>
          <select
            value={offerValue}
            onChange={(e) => setOfferValue(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4"
          >
            <option value="">Für alle / nicht zugeordnet</option>
            {offerOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <button
            onClick={addSlot}
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            Hinzufügen
          </button>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-3">Eingetragene Zeiten</h2>

          {loading && <p className="text-gray-500">Lade…</p>}
          {!loading && slots.length === 0 && (
            <p className="text-gray-500">Noch keine Zeiten eingetragen.</p>
          )}

          <div className="space-y-3">
            {slots.map((s) => (
              <div
                key={s.id}
                className="border rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-semibold">
                    {new Date(s.date).toLocaleDateString()} · {s.start}–{s.end}
                  </div>
                  <div className="text-sm text-gray-600">
                    {s.offer
                      ? `${s.offer.subject.name} · ${s.offer.schoolTrack} · ${
                          LABEL_FORM[s.offer.schoolForm] || s.offer.schoolForm
                        } · ${levelLabel(s.offer.level)} · ${s.offer.minGrade}-${s.offer.maxGrade}`
                      : "Für alle / nicht zugeordnet"}
                  </div>
                </div>

                <button
                  onClick={() => deleteSlot(s.id)}
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
