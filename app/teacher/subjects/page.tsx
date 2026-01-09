"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Subject = { id: string; name: string };

type Offer = {
  id: string;
  schoolTrack: "AHS" | "BHS" | "OTHER";
  schoolForm: string;
  level: "UNTERSTUFE" | "OBERSTUFE";
  minGrade: number;
  maxGrade: number;
  subject: { id: string; name: string };
  createdAt: string;
};

const SCHOOL_TRACKS = [
  { value: "AHS", label: "AHS" },
  { value: "BHS", label: "BHS" },
] as const;

const SCHOOL_FORMS: Record<string, { value: string; label: string }[]> = {
  AHS: [
    { value: "AHS_GYMNASIUM", label: "Gymnasium / Klassisches Gymnasium" },
    { value: "AHS_REALGYMNASIUM", label: "Realgymnasium" },
    { value: "AHS_WK_REALGYMNASIUM", label: "Wirtschaftskundliches Realgymnasium" },
    { value: "AHS_BORG", label: "BORG (Oberstufenrealgymnasium)" },
    { value: "AHS_SCHWERPUNKT", label: "AHS mit Schwerpunkt (Sport/Musik/...)" },
  ],
  BHS: [
    { value: "BHS_HTL", label: "HTL" },
    { value: "BHS_HAK", label: "HAK" },
    { value: "BHS_HLW", label: "HLW / HWS" },
    { value: "BHS_MODE", label: "HLA Mode" },
    { value: "BHS_KUNST_GESTALTUNG", label: "HLA Kunst & Gestaltung" },
    { value: "BHS_TOURISMUS", label: "HLA Tourismus" },
    { value: "BHS_SOZIALPAED", label: "Sozial-/Elementarpädagogik" },
    { value: "BHS_LAND_FORST", label: "Land- & Forstwirtschaft" },
  ],
};

function maxGradeFor(track: string) {
  if (track === "AHS") return 4;
  if (track === "BHS") return 5;
  return 5;
}

export default function TeacherSubjectsPage() {
  const { data: session, status } = useSession();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Form State
  const [subjectId, setSubjectId] = useState<string>(""); // ✅ wichtig: default leer
  const [schoolTrack, setSchoolTrack] = useState<"AHS" | "BHS">("AHS");
  const [schoolForm, setSchoolForm] = useState("AHS_GYMNASIUM");
  const [level, setLevel] = useState<"UNTERSTUFE" | "OBERSTUFE">("UNTERSTUFE");
  const [minGrade, setMinGrade] = useState(1);
  const [maxGrade, setMaxGrade] = useState(4);

  const formOptions = useMemo(
    () => SCHOOL_FORMS[schoolTrack] || [],
    [schoolTrack]
  );

  useEffect(() => {
    // wenn Track wechselt -> SchoolForm reset
    const first = formOptions?.[0]?.value || "";
    setSchoolForm(first);

    const m = maxGradeFor(schoolTrack);
    setMinGrade(1);
    setMaxGrade(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolTrack]);

  async function loadAll() {
    if (!session?.user?.email) return;

    setLoading(true);
    setMsg(null);

    try {
      const [subRes, offRes] = await Promise.all([
        fetch("/api/subjects", { cache: "no-store" }),
        fetch(`/api/teacher/offers?email=${encodeURIComponent(session.user.email)}`, {
          cache: "no-store",
        }),
      ]);

      const subJson = await subRes.json().catch(() => ({}));
      const offJson = await offRes.json().catch(() => ({}));

      const loadedSubjects: Subject[] = subJson.data || [];
      const loadedOffers: Offer[] = offJson.data || [];

      setSubjects(loadedSubjects);
      setOffers(loadedOffers);

      // ✅ subjectId nur setzen, wenn:
      // - aktuell leer ist ODER nicht mehr existiert
      if (loadedSubjects.length > 0) {
        const stillExists = loadedSubjects.some((s) => s.id === subjectId);
        if (!subjectId || !stillExists) {
          setSubjectId(loadedSubjects[0].id);
        }
      } else {
        // wenn keine Fächer existieren -> subjectId leer lassen
        setSubjectId("");
      }
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

async function createOffer() {
  if (!session?.user?.email) return;

  setMsg(null);

  const hardMax = maxGradeFor(schoolTrack);
  if (maxGrade > hardMax) {
    setMsg(`Maximale Klasse für ${schoolTrack} ist ${hardMax}.`);
    return;
  }
  if (minGrade > maxGrade) {
    setMsg("Min-Klasse darf nicht größer sein als Max-Klasse.");
    return;
  }
  if (!subjectId) {
    setMsg("Bitte ein Fach auswählen.");
    return;
  }

  try {
    const payload = {
      email: session.user.email,
      subjectId,
      schoolTrack,
      schoolForm,
      level,
      minGrade,
      maxGrade,
    };

    console.log("POST /api/teacher/offers/create payload:", payload);

    const res = await fetch("/api/teacher/offers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    console.log("POST response:", res.status, json);

    if (!res.ok) {
      setMsg(json?.error || `Fehler ${res.status}`);
      return;
    }

    setMsg("✅ Angebot hinzugefügt");
    await loadAll(); // ganz wichtig: await!
  } catch (e: any) {
    console.error(e);
    setMsg(e?.message || "Fehler beim Erstellen.");
  }
}


  async function deleteOffer(offerId: string) {
    setMsg(null);

    const res = await fetch("/api/teacher/offers/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json?.error || `Fehler ${res.status}`);
      return;
    }

    setMsg("✅ Angebot entfernt");
    loadAll();
  }

  if (status === "loading") {
    return <main className="min-h-screen bg-gray-50 px-6 py-10">Lade…</main>;
  }

  const noSubjects = !loading && subjects.length === 0;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Meine Fächer</h1>
        <p className="text-gray-600 mb-6">
          Lege fest, welche Fächer du für welche Schulformen und Klassen unterrichtest.
        </p>

        {msg && (
          <p className={`mb-4 text-sm ${msg.startsWith("✅") ? "text-green-700" : "text-red-600"}`}>
            {msg}
          </p>
        )}

        {noSubjects && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
            Es sind noch keine Fächer in der Datenbank vorhanden. <br />
            Lege zuerst Fächer an (z.B. über Seed oder `/api/subjects`).
          </div>
        )}

        {/* Formular */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-8">
          <h2 className="font-semibold mb-4">Neues Angebot hinzufügen</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Fach</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Bitte wählen…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {!subjectId && (
                <p className="text-xs text-red-600 mt-1">
                  Bitte ein Fach auswählen.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Schultyp</label>
              <select
                value={schoolTrack}
                onChange={(e) => setSchoolTrack(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {SCHOOL_TRACKS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Schulform</label>
              <select
                value={schoolForm}
                onChange={(e) => setSchoolForm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {formOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Stufe</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="UNTERSTUFE">Unterstufe</option>
                <option value="OBERSTUFE">Oberstufe</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Klasse von</label>
              <input
                type="number"
                min={1}
                max={maxGradeFor(schoolTrack)}
                value={minGrade}
                onChange={(e) => setMinGrade(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Klasse bis</label>
              <input
                type="number"
                min={1}
                max={maxGradeFor(schoolTrack)}
                value={maxGrade}
                onChange={(e) => setMaxGrade(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max für {schoolTrack}: {maxGradeFor(schoolTrack)}
              </p>
            </div>
          </div>

          <button
            onClick={createOffer}
            disabled={loading || !subjectId || subjects.length === 0}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            Angebot hinzufügen
          </button>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-semibold mb-4">Meine Angebote</h2>

          {loading && <p className="text-gray-500">Lade…</p>}

          {!loading && offers.length === 0 && (
            <p className="text-gray-500">Noch keine Angebote angelegt.</p>
          )}

          <div className="space-y-3">
            {offers.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between border rounded-xl p-4"
              >
                <div className="space-y-1">
                  <div className="font-semibold">{o.subject.name}</div>
                  <div className="text-sm text-gray-600">
                    {o.schoolTrack} · {o.schoolForm} ·{" "}
                    {o.level === "UNTERSTUFE" ? "Unterstufe" : "Oberstufe"} ·{" "}
                    Klasse {o.minGrade}–{o.maxGrade}
                  </div>
                </div>

                <button
                  onClick={() => deleteOffer(o.id)}
                  className="text-red-600 hover:underline font-medium"
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
