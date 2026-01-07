"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  onClose: () => void;
};

export default function AuthModal({ onClose }: Props) {
  const router = useRouter();

  // ✅ Kein Login-Mode mehr im Modal: nur Registrierung
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      // 1) Nutzer anlegen
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registrierung fehlgeschlagen");

      // 2) Direkt einloggen (Student Credentials!)
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

      throw new Error(
        result?.error || "Automatisches Login nach Registrierung fehlgeschlagen"
      );
    } catch (err: any) {
      setMsg(err?.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  function goToStudentLogin() {
    onClose();
    router.push("/auth/login"); // ✅ deine Schüler-Login Seite
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

        {/* ✅ NUR Registrieren (kein Anmelden-Tab mehr) */}
        <div className="mb-6 border-b pb-3">
          <h2 className="text-lg font-semibold text-center">Registrieren</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          {msg && (
            <p
              className={`text-sm ${
                /fehler|falsch|existiert|ungültig|failed/i.test(msg)
                  ? "text-red-600"
                  : "text-green-700"
              }`}
            >
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

        {/* ✅ Schon angemeldet -> zur Schüler Login Seite */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Schon angemeldet?{" "}
          <button
            onClick={goToStudentLogin}
            className="text-blue-600 hover:underline font-medium"
            type="button"
          >
            Hier anmelden
          </button>
        </p>
      </div>
    </div>
  );
}
