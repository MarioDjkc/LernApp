"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Teacher = {
  id: string;
  name: string;
  subject: string;
};

const SUBJECT_CHIPS: string[] = [
  "Mathematik",
  "Englisch",
  "Deutsch",
  "Biologie",
  "Physik",
  "Chemie",
  "Informatik",
  "Elektrotechnik",
  "BWL",
  "Recht",
  "Geschichte",
  "Geographie",
  "Spanisch",
  "Französisch",
  "Musik",
  "Kunst",
  "Sport",
  "Statistik",
  "Programmieren",
  "Wirtschaftsinformatik",
];

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // ----------------------------------------------------
  // LEHRER LADEN (über TeachingOffer + Schülerdaten)
  // ----------------------------------------------------
  async function loadTeachers(subject?: string) {
    try {
      setLoading(true);
      setError(null);

      let url = "/api/teachers";

      if (subject && subject.trim() !== "") {
        const query = encodeURIComponent(subject.trim());
        const studentEmail = encodeURIComponent(session?.user?.email || "");
        url = `/api/search?subject=${query}&studentEmail=${studentEmail}`;
      }

      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || `Fehler ${res.status}`);
      }

      setTeachers(json.data || []);
    } catch (e: any) {
      setError(e?.message || "Unbekannter Fehler beim Laden der Lehrer.");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------
  // INITIAL
  // ----------------------------------------------------
  useEffect(() => {
    if (status === "authenticated") {
      loadTeachers();
    }
  }, [status]);

  // ----------------------------------------------------
  // SUCHE (Text oder Chip)
  // ----------------------------------------------------
  useEffect(() => {
    if (status !== "authenticated") return;

    const term = searchTerm.trim();
    const subject = term.length > 0 ? term : activeSubject ?? undefined;

    const timeout = setTimeout(() => {
      loadTeachers(subject);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm, activeSubject, status]);

  function handleChipClick(subject: string) {
    setActiveSubject(subject);
    setSearchTerm(subject);
  }

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  return (
    <main className="min-h-screen bg-[#f3f5fb] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Fach suchen</h1>

          <input
            type="text"
            placeholder="Mathematik, Englisch, Deutsch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {SUBJECT_CHIPS.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => handleChipClick(subject)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  activeSubject === subject
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </header>

        {/* STATUS */}
        {loading && <p className="text-gray-500 mb-4">Lehrer werden geladen…</p>}
        {error && <p className="text-red-500 mb-4">Fehler: {error}</p>}

        {/* LISTE */}
        <section>
          {teachers.length === 0 && !loading && !error && (
            <p className="text-gray-500">Keine passenden Lehrer gefunden.</p>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teachers.map((t) => (
              <article
                key={t.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />

                  <div className="space-y-1">
                    <div className="font-semibold text-sm truncate max-w-[160px]">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-600">{t.subject}</div>
                    <div className="text-[11px] text-gray-500">
                      ★★★★☆ · 1+ Lektionen
                    </div>
                  </div>
                </div>

                <Link
                  href={`/book/${t.id}`}
                  className="whitespace-nowrap rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Termin vereinbaren
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
