"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string | null;
  email: string;
  schoolTrack: string | null;
  schoolForm: string | null;
  level: string | null;
  grade: number | null;
  createdAt: string;
  _count: { bookings: number };
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/students", { cache: "no-store" });
    const json = await res.json();
    setStudents(json.students ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Schüler "${email}" wirklich löschen?`)) return;
    setDeletingId(id);
    await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  const filtered = students.filter(
    (s) =>
      (s.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Schüler</h1>
          <p className="text-sm text-gray-500 mt-0.5">{students.length} gesamt</p>
        </div>
        <input
          type="text"
          placeholder="Name oder E-Mail suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
        />
      </div>

      {loading && <p className="text-gray-400">Lade...</p>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">E-Mail</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Schule</th>
              <th className="text-center px-5 py-3 font-semibold text-gray-600">Buchungen</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Registriert</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{s.name ?? "—"}</td>
                <td className="px-5 py-3 text-gray-600">{s.email}</td>
                <td className="px-5 py-3 text-gray-600 text-xs">
                  {[s.schoolTrack, s.schoolForm, s.level, s.grade ? `${s.grade}. Klasse` : null]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="px-5 py-3 text-center">{s._count.bookings}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {new Date(s.createdAt).toLocaleDateString("de-AT")}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => handleDelete(s.id, s.email)}
                    disabled={deletingId === s.id}
                    className="text-xs text-red-600 hover:text-red-800 disabled:opacity-40"
                  >
                    {deletingId === s.id ? "Lösche..." : "Löschen"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">Keine Schüler gefunden.</p>
        )}
      </div>
    </div>
  );
}
