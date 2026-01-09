"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  onClose: () => void;
};

type SchoolType =
  | "VS"
  | "MS"
  | "GYM"
  | "AHS"
  | "HTL"
  | "HAK"
  | "HLW"
  | "OTHER";

type SchoolLevel = "UNTERSTUFE" | "OBERSTUFE";

export default function AuthModal({ onClose }: Props) {
  const router = useRouter();

  // ✅ NUR registrieren in diesem Modal
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ NEU:
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState<SchoolType>("AHS");
  const [grade, setGrade] = useState<string>("");
  const [level, setLevel] = useState<SchoolLevel>("UNTERSTUFE");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      // 1) Nutzer anlegen
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,

          // ✅ NEU:
          schoolName,
          schoolType,
          grade: Number(grade),
          level,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registrierung fehlgeschlagen");

      // 2) Direkt einloggen (SCHÜLER provider!)
      const result = await signIn("student-credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        onClose();
        router.push("/student/dashboard");
        return;
      }

      throw new Error(result?.error || "Automatisches Login nach Registrierung fehlgeschlagen");
    } catch (err: any) {
      setMsg(err?.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl w-[92%] max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Modal schließen"
        >
          ✕
        </button>

        <h2 className="text-center font-semibold mb-4">Registrieren</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* E-Mail */}
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@mail.com"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium mb-1">Passwort</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ NEU: Schule */}
          <div>
            <label className="block text-sm font-medium mb-1">Schule</label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="z.B. HTL Wien 10"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ NEU: Schultyp */}
          <div>
            <label className="block text-sm font-medium mb-1">Schultyp</label>
            <select
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value as SchoolType)}
              className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="VS">VS</option>
              <option value="MS">MS</option>
              <option value="GYM">GYM</option>
              <option value="AHS">AHS</option>
              <option value="HTL">HTL</option>
              <option value="HAK">HAK</option>
              <option value="HLW">HLW</option>
              <option value="OTHER">Sonstiges</option>
            </select>
          </div>

          {/* ✅ NEU: Klasse */}
          <div>
            <label className="block text-sm font-medium mb-1">Klasse</label>
            <input
              type="number"
              min={1}
              max={13}
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="z.B. 3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ NEU: Unterstufe/Oberstufe */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Stufe
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as SchoolLevel)}
              className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="UNTERSTUFE">Unterstufe</option>
              <option value="OBERSTUFE">Oberstufe</option>
            </select>
          </div>

          {msg && (
            <p className="text-sm text-red-600">
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            {loading ? "Bitte warten…" : "Konto erstellen & einloggen"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Schon angemeldet?{" "}
          <button
            onClick={() => {
              onClose();
              router.push("/auth/login");
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            Hier anmelden
          </button>
        </p>
      </div>
    </div>
  );
}
