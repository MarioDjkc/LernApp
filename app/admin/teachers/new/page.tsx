"use client";

import { useState } from "react";

export default function AdminCreateTeacherPage() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    // ⛔ id wurde entfernt → also auch NICHT prüfen!
    if (!name || !subject || !applicantEmail || !adminKey) {
      setError("Bitte Name, Fach, Email und Admin-Key angeben.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          rating: Number(rating),
          avatarUrl: avatarUrl || null,
          email: applicantEmail,
          adminKey,
          password: password || undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json?.error || "Fehler beim Anlegen.");
        return;
      }

      setOkMsg("Lehrer erfolgreich angelegt!");

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
      <h1 className="text-2xl font-bold mb-4">Admin: Lehrer anlegen</h1>

      {error && <div className="text-red-600 bg-red-100 p-3 rounded mb-4">{error}</div>}
      {okMsg && <div className="text-green-700 bg-green-100 p-3 rounded mb-4">{okMsg}</div>}

      <form onSubmit={onSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium">Name *</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Fach *</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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

        <div>
          <label className="block text-sm font-medium">Avatar URL (optional)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Bewerber-Email (muss existieren) *
          </label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={applicantEmail}
            onChange={(e) => setApplicantEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Admin-Key *</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Passwort (optional)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Anlegen…" : "Lehrer anlegen"}
        </button>
      </form>
    </div>
  );
}
