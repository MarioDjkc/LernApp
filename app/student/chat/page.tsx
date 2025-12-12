"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function StudentChatPage() {
  const { data: session } = useSession();

  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [input, setInput] = useState("");

  // Chats laden
  useEffect(() => {
    async function loadChats() {
      if (!session?.user?.email) return;

      const res = await fetch(`/api/student/chat?email=${session.user.email}`);
      const data = await res.json();
      setChats(data.chats || []);
    }

    loadChats();
  }, [session?.user?.email]);

  // Nachrichten laden
  useEffect(() => {
    if (!selectedChat) return;

    async function loadMessages() {
      const res = await fetch(`/api/chat/${selectedChat}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
      setTeacherEmail(data.teacherEmail);
    }

    loadMessages();

    const interval = setInterval(loadMessages, 1500);
    return () => clearInterval(interval);
  }, [selectedChat]);

  // Nachricht senden
  async function sendMessage(e: any) {
    e.preventDefault();
    if (!input.trim()) return;

    await fetch(`/api/chat/${selectedChat}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "student", text: input }),
    });

    setInput("");
  }

  return (
    <div className="flex h-[calc(100vh-70px)] bg-gray-100">

      {/* CHAT LISTE LINKS */}
      <div className="w-[300px] bg-white border-r p-4">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>

        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-3 cursor-pointer border rounded mb-2 ${
              selectedChat === chat.id ? "bg-blue-100" : "bg-white"
            }`}
            onClick={() => setSelectedChat(chat.id)}
          >
            <p className="font-semibold">{chat.teacherEmail}</p>
            <p className="text-xs text-gray-500">Chat öffnen →</p>
          </div>
        ))}
      </div>

      {/* CHAT RECHTS */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="px-4 py-3 bg-blue-600 text-white">
          <h3 className="text-lg font-semibold">
            {teacherEmail || "Wähle einen Chat aus"}
          </h3>
        </div>

        {/* Nachrichten */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-xl px-4 py-2 rounded-xl shadow ${
                msg.sender === "student"
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-white"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Eingabe */}
        <form onSubmit={sendMessage} className="p-4 bg-white flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2"
            placeholder="Nachricht schreiben..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="px-6 bg-blue-600 text-white rounded-full">
            Senden
          </button>
        </form>

      </div>
    </div>
  );
}
