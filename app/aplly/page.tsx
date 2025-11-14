// app/apply/page.tsx
"use client";

import { useState } from "react";

export default function ApplyPage() {
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);
    setErr(null);
    setLoading(true);

    try {
      const formEl = e.currentTarget;
      const fd = new FormData(formEl);

      const res = await fetch("/api/apply", {
        method: "POST",
        body: fd, // multipart/form-data automatisch
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErr(data?.error || "Senden fehlgeschlagen.");
        return;
      }

      setOk("Bewerbung erfolgreich gesendet. Wir melden uns bei dir!");
      formEl.reset();
    } catch (e) {
      setLoading(false);
      setErr("Netzwerkfehler.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Bewirb dich als Lehrer/in</h1>
        <p className="text-gray-600 text-sm">
          Sende uns kurz deine Daten, dein Bewerbungsschreiben und lade dein letztes Zeugnis (PDF) hoch.
        </p>

        {ok && <div className="border border-green-300 bg-green-50 text-green-700 rounded p-2">{ok}</div>}
        {err && <div className="border border-red-300 bg-red-50 text-red-700 rounded p-2">{err}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Name *</span>
              <input name="name" required className="mt-1 w-full border rounded p-2" placeholder="Max Mustermann" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">E-Mail *</span>
              <input name="email" type="email" required className="mt-1 w-full border rounded p-2" placeholder="max@mail.com" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Fach (optional)</span>
            <input name="subject" className="mt-1 w-full border rounded p-2" placeholder="Mathematik" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Bewerbungsschreiben *</span>
            <textarea name="letter" required rows={6} className="mt-1 w-full border rounded p-2" placeholder="Warum möchtest du unterrichten?"></textarea>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Zeugnis (PDF) *</span>
            <input name="file" type="file" accept="application/pdf" required className="mt-1 w-full" />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Senden …" : "Bewerbung abschicken"}
          </button>
        </form>
      </div>
    </main>
  );
}
