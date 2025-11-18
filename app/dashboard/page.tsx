"use client";

import { useEffect, useState } from "react";

type Teacher = {
  id: string;
  name: string;
  subject: string;
  rating?: number;
  avatarUrl?: string | null;
};

const SUBJECT_TAGS = [
  "Mathematik", "Englisch", "Deutsch", "Biologie", "Physik", "Chemie",
  "Informatik", "Elektrotechnik", "BWL", "Recht", "Geschichte",
  "Geographie", "Spanisch", "Französisch", "Musik", "Kunst", "Sport",
  "Statistik", "Programmieren", "Wirtschaftsinformatik"
];

export default function StudentDashboard() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");

  // ------- LEHRER LADEN -------
  const loadTeachers = async (value: string) => {
    const url = value
      ? `/api/search?subject=${encodeURIComponent(value)}`
      : "/api/search";

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    setTeachers(data.data);
  };

  // Erstes Laden → zeigt alle Lehrer
  useEffect(() => {
    loadTeachers("");
  }, []);

  // Bei Eingabe → automatisch filtern
  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setSearch(value);
    loadTeachers(value);
  };

  // Klick auf Tag
  const handleTagClick = (tag: string) => {
    setSearch(tag);
    loadTeachers(tag);
  };

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-6 py-10 flex justify-center">
      <div className="w-full max-w-6xl">

        {/* ----- TITLE ----- */}
        <h1 className="text-4xl font-bold mb-6">Fach suchen</h1>

        {/* ----- SEARCH INPUT ----- */}
        <div className="mb-6">
          <input
            value={search}
            onChange={handleInputChange}
            placeholder="Mathematik, Englisch, Deutsch..."
            className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-gray-300 shadow-sm"
          />
        </div>

        {/* ----- SUBJECT TAGS ----- */}
        <div className="flex flex-wrap gap-3 mb-10">
          {SUBJECT_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm hover:bg-gray-50"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* ----- TEACHER GRID ----- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {teachers.length > 0 &&
            teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />

                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{t.name}</span>
                    <span className="text-gray-600 text-sm">{t.subject}</span>
                    <span className="text-xs text-gray-500">Neu</span>
                  </div>
                </div>

                <div className="mt-3 text-orange-400 text-sm">
                  ★★★★★
                </div>

                <div className="mt-4">
                  <a
                    href={`/book/${t.id}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition"
                  >
                    Termin vereinbaren
                  </a>
                </div>
              </div>
            ))}

          {teachers.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              Keine Lehrer gefunden.
            </p>
          )}

        </div>

      </div>
    </main>
  );
}
