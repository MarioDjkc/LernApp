// app/search/page.tsx
import Image from "next/image";

type Teacher = {
  id: string;
  name: string;
  subject: string;
  rating: number;
  avatarUrl?: string | null;
};

async function loadTeachers(): Promise<Teacher[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/teachers`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: Teacher[] };
  return json.data ?? [];
}

export default async function SearchPage() {
  const teachers = await loadTeachers();

  return (
    <main className="mx-auto max-w-6xl px-6 md:px-10 py-10 space-y-8">
      <h1 className="text-4xl font-bold">Fach suchen</h1>

      {/* einfache Suche (Frontend-only) */}
      {/* Du kannst hier später echte Filter/Tags anschließen */}
      {/* Aktuell nur Darstellung der DB-Daten */}

      {teachers.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-600">
          Zur Zeit sind noch keine Lehrerprofile veröffentlicht.
          <br />
          Bald erscheinen hier echte Profile.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border bg-white p-5 shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {t.avatarUrl ? (
                  <Image
                    src={t.avatarUrl}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <div className="font-semibold truncate">{t.name}</div>
                <div className="text-sm text-gray-600">{t.subject}</div>
                <div className="text-yellow-400 text-sm">
                  {"★".repeat(Math.max(0, Math.min(5, t.rating)))}
                  {"☆".repeat(Math.max(0, 5 - t.rating))}
                </div>
              </div>
              <a
                href={`/book/${t.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap"
              >
                Termin vereinbaren
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
