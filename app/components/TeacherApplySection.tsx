"use client";

import { useState } from "react";

export default function TeacherApplySection() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOk(null);
    setErr(null);
    setLoading(true);

    try {
      const formEl = e.currentTarget;
      const fd = new FormData(formEl);

      const res = await fetch("/api/teachers/apply", {
        method: "POST",
        body: fd,
      });

      // 👉 Text lesen, damit wir saubere Fehlermeldungen anzeigen können
      const raw = await res.text();
      let data: any = null;
      try { data = JSON.parse(raw); } catch { /* ignorieren */ }

      if (!res.ok) {
        setErr(data?.error || raw || `Fehler ${res.status}`);
        setLoading(false);
        return;
      }

      setOk("Bewerbung wurde erfolgreich gesendet – wir melden uns per E-Mail!");
      formEl.reset();
      setLoading(false);
    } catch (e: any) {
      setErr(`Netzwerkfehler: ${e?.message || e}`);
      setLoading(false);
    }
  }


  return (
    <section className="bg-blue-50 border-t">
      <div className="mx-auto max-w-5xl px-6 md:px-10 py-16 grid md:grid-cols-2 gap-10 items-start">
        {/* Linke Seite – Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Bewirb dich als Lehrer</h2>
          <p className="text-gray-700">
            Sende uns dein Bewerbungsschreiben und lade dein letztes Zeugnis (PDF) hoch.
            Nach dem Absenden erhalten wir automatisch eine E-Mail.
          </p>
          <ul className="text-gray-700 space-y-1">
            <li>• Geprüfte Lehrkräfte – schnelle Rückmeldung</li>
            <li>• Flexible Zeiten, online &amp; vor Ort</li>
            <li>• Fächer frei wählbar</li>
          </ul>
        </div>

        {/* Rechte Seite – Formular */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          {ok && (
            <div className="border border-green-300 bg-green-50 text-green-700 rounded p-2">
              {ok}
            </div>
          )}
          {err && (
            <div className="border border-red-300 bg-red-50 text-red-700 rounded p-2">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Name *</span>
              <input
                name="name"
                required
                className="mt-1 w-full border rounded p-2"
                placeholder="Simon Weber"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">E-Mail *</span>
              <input
                type="email"
                name="email"
                required
                className="mt-1 w-full border rounded p-2"
                placeholder="max@mail.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Fach (optional)</span>
              <input
                name="subject"
                className="mt-1 w-full border rounded p-2"
                placeholder="Mathematik"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Bewerbungsschreiben *</span>
              <textarea
                name="letter"
                required
                rows={6}
                className="mt-1 w-full border rounded p-2"
                placeholder="Warum möchtest du unterrichten?"
              ></textarea>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Zeugnis (PDF) *</span>
              <input
                type="file"
                name="file"
                accept="application/pdf"
                required
                className="mt-1 w-full"
              />
              <span className="text-xs text-gray-500">Nur PDF, max. 10 MB.</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Wird gesendet …" : "Bewerbung absenden"}
            </button>

            <p className="text-xs text-gray-500">
              Mit dem Absenden akzeptierst du unsere Datenschutzbestimmungen.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
