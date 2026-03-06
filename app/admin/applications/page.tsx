"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Application = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  letter: string | null;
  filePath: string | null;
  schoolTrack: string | null;
  levelPref: string | null;
  schoolForms: string | null;
  createdAt: string;
};

const FORM_LABELS: Record<string, string> = {
  AHS_GYMNASIUM: "Gymnasium", AHS_REALGYMNASIUM: "Realgymnasium",
  AHS_WK_REALGYMNASIUM: "WK-Realgymnasium", AHS_BORG: "BORG",
  AHS_SCHWERPUNKT: "AHS Schwerpunkt", BHS_HTL: "HTL", BHS_HAK: "HAK",
  BHS_HLW: "HLW", BHS_MODE: "HLA Mode", BHS_KUNST_GESTALTUNG: "Kunst & Gestaltung",
  BHS_TOURISMUS: "Tourismus", BHS_SOZIALPAED: "Sozialpaedagogik",
  BHS_LAND_FORST: "Land- & Forstwirtschaft",
};

function trackLabel(v: string | null) {
  if (v === "AHS") return "Nur AHS";
  if (v === "BHS") return "Nur BHS";
  if (v === "BOTH") return "AHS & BHS";
  return "—";
}

function levelLabel(v: string | null) {
  if (v === "UNTERSTUFE") return "Nur Unterstufe (Kl. 1-4)";
  if (v === "OBERSTUFE") return "Nur Oberstufe (Kl. 5+)";
  if (v === "BOTH") return "Unter- & Oberstufe";
  return "—";
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/applications", { cache: "no-store" });
    const json = await res.json();
    setApplications(json.applications ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Bewerbung von "${name}" wirklich löschen?`)) return;
    setDeletingId(id);
    await fetch("/api/admin/applications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeletingId(null);
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bewerbungen</h1>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} gesamt</p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          + Lehrer daraus anlegen
        </Link>
      </div>

      {loading && <p className="text-gray-400">Lade...</p>}
      {!loading && applications.length === 0 && (
        <p className="text-gray-500">Keine Bewerbungen vorhanden.</p>
      )}

      <div className="space-y-4">
        {applications.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="font-semibold text-base">{a.name}</div>
                <div className="text-sm text-gray-500">{a.email}</div>
                {a.subject && (
                  <div className="text-xs text-blue-600 mt-0.5">Fach: {a.subject}</div>
                )}
                <div className="text-xs text-gray-400 mt-0.5">
                  {trackLabel(a.schoolTrack)} · {levelLabel(a.levelPref)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleDateString("de-AT")}
                </span>
                <button
                  onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {expanded === a.id ? "Einklappen" : "Details"}
                </button>
                {a.filePath && (
                  <a
                    href={a.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline"
                  >
                    PDF
                  </a>
                )}
                <button
                  onClick={() => handleDelete(a.id, a.name)}
                  disabled={deletingId === a.id}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-40"
                >
                  {deletingId === a.id ? "Lösche..." : "Löschen"}
                </button>
              </div>
            </div>

            {/* DETAILS */}
            {expanded === a.id && a.letter && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Motivationsschreiben</div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {a.letter}
                </p>
                {a.schoolForms && (() => {
                  try {
                    const forms: string[] = JSON.parse(a.schoolForms);
                    return (
                      <div className="mt-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Schulformen</div>
                        <div className="flex flex-wrap gap-1">
                          {forms.map((f) => (
                            <span key={f} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                              {FORM_LABELS[f] ?? f}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}
                <div className="mt-4">
                  <Link
                    href={`/admin/teachers/new?email=${encodeURIComponent(a.email)}&name=${encodeURIComponent(a.name)}&subject=${encodeURIComponent(a.subject ?? "")}&schoolTrack=${encodeURIComponent(a.schoolTrack ?? "BOTH")}&levelPref=${encodeURIComponent(a.levelPref ?? "BOTH")}&schoolForms=${encodeURIComponent(a.schoolForms ?? "")}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Als Lehrer anlegen
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
