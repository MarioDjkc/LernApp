"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "./components/AuthModal";
import ChatWhatsAppModal from "./components/ChatWidget";
import TeacherCarouselWrapper from "@/src/components/TeacherCarouselWrapper";
import TeacherApplySection from "./components/TeacherApplySection";
import type { Teacher } from "@/app/lib/types";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);

  // 🔹 Nur 4 Beispiel-Lehrer zur Deko auf der Hauptseite
  const teachers: Teacher[] = [
    { id: "t1", name: "Anna Weber", subject: "Mathematik", rating: 5 },
    { id: "t2", name: "Paul Schmidt", subject: "Englisch", rating: 5 },
    { id: "t3", name: "Maria Fischer", subject: "Biologie", rating: 5 },
    { id: "t4", name: "David Müller", subject: "Physik", rating: 5 },
  ];

  return (
    <main className="min-h-screen">
      {/* 🔹 Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* 🔹 HERO */}
      <section className="mx-auto max-w-6xl px-6 md:px-10 py-12 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Nachhilfetermine
            <br /> einfach buchen
          </h1>
          <p className="text-gray-600">
            Vereinbare online deine Einzelsitzung mit einer Nachhilfelehrerin
            oder einem Nachhilfelehrer deiner Wahl.
          </p>

          {/* Buttons: Jetzt buchen + Lehrer-Login */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Jetzt buchen
            </button>

            <Link
              href="/auth/teacher/login"
              className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 font-semibold bg-white hover:bg-blue-50 transition"
            >
              Lehrer-Login
            </Link>
          </div>
        </div>

        <div className="justify-self-end">
          <div className="w-[320px] h-[360px] bg-gray-200 rounded-2xl shadow flex items-center justify-center text-gray-500">
            Bild kommt später 📷
          </div>
        </div>
      </section>

      {/* 🔹 NUR 4 LEHRER ANZEIGEN */}
      <section className="bg-white border-t">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-14">
          <h2 className="text-3xl font-bold text-center mb-10">
            Unsere Lehrerinnen & Lehrer
          </h2>
          <TeacherCarouselWrapper teachers={teachers} />
        </div>
      </section>

      {/* 🔹 ABLAUF */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-16">
          <h2 className="text-3xl font-bold text-center mb-10">Ablauf</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="space-y-3">
              <div className="text-4xl">👩‍🏫</div>
              <h3 className="font-semibold text-xl">Lehrperson wählen</h3>
              <p className="text-gray-600">
                Wähle deine Lehrerin oder deinen Lehrer sowie Datum und Zeit aus.
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">📅</div>
              <h3 className="font-semibold text-xl">Termin buchen</h3>
              <p className="text-gray-600">
                Gib deine Daten ein und bestätige die Buchung.
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">📚</div>
              <h3 className="font-semibold text-xl">Lernen!</h3>
              <p className="text-gray-600">
                Triff deine Lehrerin oder deinen Lehrer und beginne die Nachhilfe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔹 TESTIMONIALS */}
      <section className="bg-white border-t">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-16">
          <h2 className="text-3xl font-bold text-center mb-3">
            Was unsere Nutzer sagen
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Echte Erfahrungen von Schülerinnen, Schülern und Eltern
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Lea K.",
                role: "Schülerin (Mathe)",
                text: "Ich habe endlich Mathe verstanden. Die Buchung war super einfach und meine Lehrerin war mega nett!",
                stars: 5,
              },
              {
                name: "Tim S.",
                role: "Schüler (Englisch)",
                text: "Die 1:1-Sitzungen haben mir geholfen, mein Englisch zu verbessern. Sehr flexible Zeiten!",
                stars: 5,
              },
              {
                name: "Sandra M.",
                role: "Mutter",
                text: "Transparente Buchung, freundliche Lehrerinnen und Lehrer und schnelle Terminbestätigung. Absolute Empfehlung.",
                stars: 5,
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border shadow-sm bg-white p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-600">{t.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">“{t.text}”</p>
                <div className="text-yellow-400">
                  {"★".repeat(t.stars)}
                  {"☆".repeat(5 - t.stars)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔹 LEHRER BEWERBUNG */}
      <TeacherApplySection />

      {/* 🔹 FOOTER */}
      <footer className="bg-white border-t">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg">LernApp</div>
            <p className="text-gray-600 mt-2">
              Nachhilfe einfach online buchen – von geprüften Lehrerinnen & Lehrern.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-2">Angebot</div>
            <ul className="space-y-1 text-gray-600">
              <li>Mathematik</li>
              <li>Englisch</li>
              <li>Biologie</li>
              <li>Physik</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Rechtliches</div>
            <ul className="space-y-1 text-gray-600">
              <li>
                <a href="/agb" className="hover:text-blue-600 hover:underline">AGB</a>
              </li>
              <li>
                <a href="/datenschutz" className="hover:text-blue-600 hover:underline">
                  Datenschutzerklärung
                </a>
              </li>
              <li>
                <a href="/impressum" className="hover:text-blue-600 hover:underline">Impressum</a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Kontakt</div>
            <ul className="space-y-1 text-gray-600">
              <li>support@lernapp.example</li>
              <li>+43 660 000000</li>
              <li>Mo–Fr 9–17 Uhr</li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-6 text-sm text-gray-500 flex items-center justify-between">
            <span>© {new Date().getFullYear()} LernApp</span>
            <span>Made with ❤️</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
