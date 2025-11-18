"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      setError("Falsche Login-Daten.");
      return;
    }

    const data = await response.json();

    // Rolle prüfen → redirect
    if (data.role === "STUDENT") {
      router.push("/search"); // Schüler → Lehrer auswählen
    } else if (data.role === "TEACHER") {
      router.push("/teacher/dashboard");
    } else if (data.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form
        onSubmit={handleLogin}
        className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">E-Mail</label>
          <input
            type="email"
            className="border border-gray-300 rounded-xl px-4 py-3 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* PASSWORT */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">Passwort</label>
          <input
            type="password"
            className="border border-gray-300 rounded-xl px-4 py-3 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          className="bg-black text-white w-full py-3 rounded-xl hover:opacity-80 transition"
        >
          Einloggen
        </button>
      </form>
    </div>
  );
}
