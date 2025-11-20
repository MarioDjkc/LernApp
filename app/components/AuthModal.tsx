"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  onClose: () => void;
};

export default function AuthModal({ onClose }: Props) {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const switchTo = (m: "login" | "register") => {
    setMode(m);
    setMsg(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      if (mode === "register") {
        // 1) Nutzer anlegen
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registrierung fehlgeschlagen");

        // 2) Direkt einloggen
        const result = await signIn("credentials", {
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
      } else {
        // Login
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.ok) {
          onClose();
          router.push("/student/dashboard");
          return;
        }
        setMsg("E-Mail oder Passwort ist falsch");
      }
    } catch (err: any) {
      setMsg(err?.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-[92%] max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Modal schließen"
        >
          ✕
        </button>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`flex-1 py-2 font-semibold ${
              mode === "login" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => switchTo("login")}
          >
            Anmelden
          </button>
          <button
            className={`flex-1 py-2 font-semibold ${
              mode === "register" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => switchTo("register")}
          >
            Registrieren
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
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
          )}

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
                /fehler|falsch|existiert|ungültig|failed/i.test(msg) ? "text-red-600" : "text-green-700"
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
            {loading
              ? "Bitte warten…"
              : mode === "login"
              ? "Einloggen"
              : "Konto erstellen & einloggen"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          {mode === "login" ? (
            <>
              Kein Konto?{" "}
              <button
                onClick={() => switchTo("register")}
                className="text-blue-600 hover:underline font-medium"
              >
                Jetzt registrieren
              </button>
            </>
          ) : (
            <>
              Bereits registriert?{" "}
              <button
                onClick={() => switchTo("login")}
                className="text-blue-600 hover:underline font-medium"
              >
                Anmelden
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
