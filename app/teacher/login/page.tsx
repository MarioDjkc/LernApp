"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function TeacherLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("E-Mail oder Passwort falsch.");
      return;
    }

    // ✅ Erfolgreich eingeloggt → Lehrer-Dashboard
    router.push("/teacher/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Lehrer-Login</h1>

        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}

        <input
          type="email"
          placeholder="E-Mail"
          className="w-full mb-3 border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Passwort"
          className="w-full mb-4 border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          {loading ? "Anmelden…" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
