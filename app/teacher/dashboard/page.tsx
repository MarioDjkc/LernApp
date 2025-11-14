// app/teacher/dashboard/page.tsx
"use client";

import { useState, FormEvent } from "react";

type Message = {
  id: number;
  from: "teacher" | "student";
  text: string;
  time: string;
};

export default function TeacherDashboardPage() {
  const [activeChat, setActiveChat] = useState("Max Mustermann");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: "student",
      text: "Hallo, ich hätte gerne Hilfe bei Mathe.",
      time: "09:12",
    },
    {
      id: 2,
      from: "teacher",
      text: "Hi Max, gerne! Wann passt es dir?",
      time: "09:14",
    },
  ]);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      from: "teacher",
      text: message.trim(),
      time: new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");
  }

  return (
    <div className="min-h-screen bg-[#f3f5fb] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[1.2fr,1.8fr] min-h-[540px]">
          {/* KALENDER-LINKS (verbessert) */}
          <section className="border-r border-slate-100 p-6 flex flex-col">
            {/* Kopfzeile */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Kalender
                </h2>
                <p className="text-xs text-slate-500">
                  Woche 22.–26. April · 2025
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-sm text-slate-500 hover:bg-slate-50">
                  ‹
                </button>
                <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-sm text-slate-500 hover:bg-slate-50">
                  ›
                </button>
                <button className="ml-1 px-3 py-1.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700 hover:bg-slate-200">
                  Heute
                </button>
              </div>
            </div>

            {/* Wochentage */}
            <div className="pl-14 pr-2 mb-2 flex justify-between text-[11px] font-medium text-slate-500">
              {[
                { label: "Mo", date: "22", isToday: false },
                { label: "Di", date: "23", isToday: true },
                { label: "Mi", date: "24", isToday: false },
                { label: "Do", date: "25", isToday: false },
                { label: "Fr", date: "26", isToday: false },
              ].map((d) => (
                <div key={d.label} className="flex flex-col items-center gap-1">
                  <span>{d.label}</span>
                  <span
                    className={
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] " +
                      (d.isToday
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700")
                    }
                  >
                    {d.date}
                  </span>
                </div>
              ))}
            </div>

            {/* Gitter + Zeiten */}
            <div className="flex flex-1">
              {/* Zeiten links */}
              <div className="w-14 pr-2 text-[11px] text-slate-400 space-y-5 pt-6">
                <div>08:00</div>
                <div>09:00</div>
                <div>10:00</div>
                <div>11:00</div>
                <div>12:00</div>
                <div>13:00</div>
                <div>14:00</div>
              </div>

              {/* Grid */}
              <div className="flex-1 relative">
                <div className="h-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <div className="grid grid-cols-5 grid-rows-7 h-full">
                    {/* vertikale Linien */}
                    {Array.from({ length: 5 }).map((_, col) => (
                      <div
                        key={"col-" + col}
                        className={
                          "border-l border-slate-100/80 row-span-7 " +
                          (col === 1
                            ? "bg-blue-50/40" // "Heute"-Spalte leicht hervorheben
                            : "")
                        }
                      />
                    ))}
                    {/* horizontale Linien */}
                    {Array.from({ length: 7 }).map((_, row) => (
                      <div
                        key={"row-" + row}
                        className="col-span-5 border-t border-slate-100/70"
                      />
                    ))}
                  </div>
                </div>

                {/* Termine */}
                <div className="pointer-events-none absolute inset-0 px-3 py-4">
                  {/* Mathe-Termin */}
                  <div
                    className="absolute left-[20%] w-[18%] bg-blue-500/90 text-white text-[11px] font-semibold rounded-xl shadow-md flex flex-col items-center justify-center"
                    style={{ top: "16%", height: "22%" }}
                  >
                    <span>Math</span>
                    <span className="text-[9px] font-normal opacity-80">
                      09:00–10:00
                    </span>
                  </div>

                  {/* Englisch-Termin */}
                  <div
                    className="absolute left-[52%] w-[18%] bg-indigo-500/90 text-white text-[11px] font-semibold rounded-xl shadow-md flex flex-col items-center justify-center"
                    style={{ top: "46%", height: "22%" }}
                  >
                    <span>Englisch</span>
                    <span className="text-[9px] font-normal opacity-80">
                      11:00–12:00
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* kleine Legende unten */}
            <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-blue-500/90" />
                <span>Bestätigter Termin</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-indigo-500/90" />
                <span>Angefragter Termin</span>
              </div>
            </div>
          </section>

          {/* CHAT-AREA RECHTS (WhatsApp-Style) */}
          <section className="flex flex-col">
            {/* Header oben über beiden Spalten */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Chat</h2>
              <button className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">
                Termin anfragen
              </button>
            </div>

            <div className="flex flex-1">
              {/* CONTACT-LISTE (links im Chat-Bereich) */}
              <div className="w-64 border-r border-slate-100 flex flex-col">
                {/* Suche */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-500 focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="text-slate-400 text-sm">🔍</span>
                    <input
                      type="text"
                      placeholder="Schüler oder Fach suchen"
                      className="bg-transparent outline-none flex-1 text-xs text-slate-700"
                    />
                  </div>
                </div>

                {/* Fake-Chats */}
                <div className="flex-1 overflow-y-auto">
                  {[
                    {
                      name: "Max Mustermann",
                      subject: "Mathematik",
                      last: "Danke, bis morgen!",
                      time: "09:30",
                      unread: 2,
                    },
                    {
                      name: "Lisa Meier",
                      subject: "Englisch",
                      last: "Okay, ich schaue mir das an.",
                      time: "Gestern",
                      unread: 0,
                    },
                  ].map((chat) => {
                    const active = activeChat === chat.name;
                    return (
                      <button
                        key={chat.name}
                        onClick={() => setActiveChat(chat.name)}
                        className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-slate-50 ${
                          active ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white flex items-center justify-center">
                          {chat.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[13px] font-semibold text-slate-900 truncate">
                              {chat.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {chat.time}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mb-0.5">
                            {chat.subject}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-slate-500 truncate">
                              {chat.last}
                            </span>
                            {chat.unread > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center min-w-[18px] px-1 h-[18px] rounded-full bg-blue-500 text-[10px] text-white">
                                {chat.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHAT-FENSTER RECHTS */}
              <div className="flex-1 flex flex-col">
                {/* Chat-Kopf */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {activeChat}
                    </div>
                    <div className="text-[11px] text-emerald-500">
                      online · Mathe
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400 text-lg">
                    <button className="hover:text-slate-600">📞</button>
                    <button className="hover:text-slate-600">🎥</button>
                    <button className="hover:text-slate-600">⋯</button>
                  </div>
                </div>

                {/* Nachrichten-Bereich */}
                <div className="flex-1 bg-slate-50/60 px-4 py-3 overflow-y-auto">
                  <div className="text-[10px] text-slate-400 text-center mb-3">
                    Heute
                  </div>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`mb-2 flex ${
                        m.from === "teacher" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm ${
                          m.from === "teacher"
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-white text-slate-900 rounded-bl-sm"
                        }`}
                      >
                        <div>{m.text}</div>
                        <div className="text-[9px] mt-1 opacity-70 text-right">
                          {m.time}
                        </div>
                      </div>
                    </div>
                  ))}

                  {messages.length === 0 && (
                    <p className="text-[13px] text-slate-500 text-center mt-10">
                      Noch keine Nachrichten. Sende deine erste Nachricht an{" "}
                      {activeChat}.
                    </p>
                  )}
                </div>

                {/* Eingabefeld unten */}
                <form
                  onSubmit={handleSend}
                  className="border-t border-slate-200 px-4 py-3 bg-white"
                >
                  <div className="flex items-center gap-2 mb-2 text-xl text-slate-400">
                    <button
                      type="button"
                      className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm"
                    >
                      📎
                    </button>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm"
                    >
                      🙂
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nachricht schreiben…"
                      className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm hover:bg-blue-700"
                    >
                      ➤
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
