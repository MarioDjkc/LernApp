"use client";

import { useState } from "react";

export default function AdminCreateTeacherPage() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [password, setPassword] = useState(""); // optional – leer lassen ⇒ Temp-PW wird generiert

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    if (!id || !name || !subject || !applicantEmail || !adminKey) {
      setError("Bitte id, name, subject, rating, applicantEmail und adminKey angeben.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name,
          subject,
          rating: Number(rating),
          avatarUrl: avatarUrl || null,
          email: applicantEmail,
          adminKey,
          password: password || undefined, // leer ⇒ API generiert Temp-PW
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json?.error || "Fehler beim Anlegen.");
        return;
      }

      // Hinweis: Deine API gibt (falls generiert) tempPassword im JSON zurück.
      if (json?.tempPassword) {
        setOkMsg(
          `Lehrer angelegt. Temporäres Passwort: ${json.tempPassword} (wurde per E-Mail verschickt).`
        );
      } else {
        setOkMsg("Lehrer angelegt.");
      }

      // Felder leeren
      setId("");
      setName("");
      setSubject("");
      setRating(5);
      setAvatarUrl("");
      setApplicantEmail("");
      setPassword("");
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin: Lehrer anlegen</h1>
        <a
          className="text-sm underline"
          href="/admin/login"
          title="Zum Admin-Login"
        >
          Admin-Login
        </a>
      </div>

      <p className="text-gray-600 mb-6">
        Trage einen neuen echten Lehrer in die Datenbank ein.{" "}
        <span className="font-semibold">
          Es wird geprüft, ob eine passende Bewerbung in <code>TeacherApplication</code> existiert
        </span>{" "}
        (Abgleich über die Bewerber-E-Mail).
      </p>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 text-red-700 p-3 mb-4">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="rounded border border-green-300 bg-green-50 text-green-700 p-3 mb-4">
          {okMsg}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Lehrer-ID *</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="t42"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rating (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              className="w-full border rounded px-3 py-2"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Name *</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Max Mustermann"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Fach *</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Mathematik"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Avatar URL (optional)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="/avatars/max.jpg oder https://…"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Bewerber-E-Mail (muss in TeacherApplication existieren) *
            </label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              required
              placeholder="bewerber@mail.de"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Admin-Key *</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
              placeholder="dein ADMIN_KEY aus .env"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Passwort (optional – leer lassen ⇒ Temp-Passwort wird generiert)
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Anlegen…" : "Lehrer anlegen"}
        </button>
      </form>

      <div className="mt-6">
        <a
          className="text-sm text-gray-600 underline"
          href="/admin/login"
          title="Abmelden"
          onClick={() => {
            // nur ein Link – Logout machst du ggf. über /api/admin/logout
          }}
        >
          Logout
        </a>
      </div>
    </div>
  );
}
