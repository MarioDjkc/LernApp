"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function TeacherChatPage() {
  const { data: session } = useSession();

  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  // Chats laden
  async function loadChats() {
    if (!session?.user?.email) return;

    const res = await fetch(
      `/api/chats/teacher?email=${session.user.email}`
    );
    const data = await res.json();
    setChats(data.chats || []);
  }

  // Nachrichten für aktiven Chat laden
  async function loadMessages(chatId: string) {
    const res = await fetch(`/api/chats/${chatId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  // Beim Laden Chats holen
  useEffect(() => {
    loadChats();
  }, [session?.user?.email]);

  // Intervall zum Chat aktualisieren
  useEffect(() => {
    if (!activeChat) return;
    loadMessages(activeChat.id);
    const interval = setInterval(
      () => loadMessages(activeChat.id),
      2000
    );
    return () => clearInterval(interval);
  }, [activeChat]);

  // Nachricht senden
  async function sendMessage(e: any) {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    await fetch(`/api/chats/${activeChat.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "teacher", text: input }),
    });

    setInput("");
    loadMessages(activeChat.id);
  }

  return (
    <div className="flex h-[85vh] bg-white shadow rounded-xl">
      
      {/* Chat-Liste */}
      <div className="w-1/3 border-r p-4">
        <h2 className="font-bold text-lg mb-4">Chats</h2>

        <div className="space-y-3">
          {chats.map((c: any) => {
            const last = c.messages[0];
            return (
              <div
                key={c.id}
                className="p-3 border rounded cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => setActiveChat(c)}
              >
                <p className="font-semibold">{c.studentEmail}</p>
                <p className="text-sm text-gray-500">
                  {last ? last.text : "Keine Nachrichten"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aktiver Chat */}
      <div className="flex-1 flex flex-col p-4">
        {!activeChat ? (
          <p className="text-gray-500">Wähle einen Chat aus…</p>
        ) : (
          <>
            <h2 className="font-bold text-lg mb-2">
              Chat mit {activeChat.studentEmail}
            </h2>

            <div className="flex-1 overflow-y-auto border rounded p-4 bg-gray-50 space-y-3">
              {messages.map((m: any) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg max-w-[70%] ${
                    m.sender === "teacher"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  {m.text}
                  <div className="text-xs opacity-60">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 mt-3">
              <input
                className="flex-1 border rounded px-3 py-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nachricht schreiben…"
              />
              <button className="bg-blue-600 text-white px-4 rounded">
                Senden
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
