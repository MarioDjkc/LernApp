"use client";

import { useEffect, useState } from "react";
import ChatWhatsAppModal from "../components/ChatWidget";
import BookingModal from "../components/BookingModal";

type Teacher = {
  id: string;
  name: string;
  subject: string;
  rating: number;
  avatarUrl?: string | null;
  lessonsCount: number;
};

const SUBJECT_TAGS = [
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

function Stars({ rating }: { rating: number }) {
  const full = Math.max(0, Math.min(5, rating));
  return (
    <span className="text-amber-500">
      {"★".repeat(full)}
      <span className="text-gray-300">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  // Booking modal state
  const [bookOpen, setBookOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<
    { id: string; name: string; subject: string } | null
  >(null);

  // Initial laden
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/teachers", { cache: "no-store" });
      const json = await res.json();
      setTeachers(json.data ?? []);
    })();
  }, []);

  // Suche + Filter (debounced)
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (activeTag) params.set("subject", activeTag);
        const res = await fetch(`/api/teachers?${params.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        setTeachers(json.data ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, activeTag]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Fach suchen</h1>

        {/* Suche */}
        <div className="mb-4">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mathematik, Englisch, Deutsch…"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pl-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SUBJECT_TAGS.map((s) => {
            const active = activeTag === s;
            return (
              <button
                key={s}
                onClick={() => setActiveTag((prev) => (prev === s ? null : s))}
                className={`px-4 py-1.5 rounded-full border transition ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Status */}
        {loading && <div className="text-gray-500 mb-4">Laden…</div>}
        {!loading && teachers.length === 0 && (
          <div className="text-gray-500 mb-4">
            Keine Treffer – Suchbegriff oder Fach anpassen.
          </div>
        )}

        {/* Lehrer-Karten */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((t) => {
            const lessons =
              typeof t.lessonsCount === "number" ? t.lessonsCount : 0;
            const lessonsLabel = lessons > 0 ? `${lessons} Lektionen` : "Neu";

            return (
              <article
                key={t.id}
                className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition p-5"
              >
                {/* Grid sorgt dafür, dass unten nichts „leer“ ist */}
                <div className="grid grid-cols-[3.5rem_1fr_auto] grid-rows-[auto_auto] gap-x-4 gap-y-2 items-center">
                  {/* Avatar (span 2 rows) */}
                  <div className="row-span-2 w-14 h-14 rounded-full bg-gray-200 overflow-hidden ring-4 ring-gray-50">
                    {t.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>

                  {/* Name */}
                  <div className="font-semibold text-lg truncate">{t.name}</div>

                  {/* Button */}
                  <button
                    className="justify-self-end rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-sm"
                    onClick={() => {
                      setSelectedTeacher({
                        id: t.id,
                        name: t.name,
                        subject: t.subject,
                      });
                      setBookOpen(true);
                    }}
                    title="Termin vereinbaren"
                  >
                    Termin vereinbaren
                  </button>

                  {/* Fach */}
                  <div className="text-sm text-gray-600 col-span-2">
                    {t.subject}
                  </div>

                  {/* Bewertung + Lektionen */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                    <Stars rating={t.rating} />
                    <span className="text-gray-300">•</span>
                    <span className="truncate">{lessonsLabel}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        teacher={selectedTeacher}
      />

      {/* Chatwidget */}
      <ChatWhatsAppModal />
    </main>
  );
}
