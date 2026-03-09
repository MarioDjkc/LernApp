"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

export default function TeacherChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [studentEmail, setStudentEmail] = useState("");
  const [input, setInput] = useState("");

  // -------------------
  // LINKS: CHATLISTE LADEN
  // -------------------
  useEffect(() => {
    if (!session?.user?.email) return;

    async function loadChats() {
      const res = await fetch(`/api/teacher/chat?email=${session.user.email}`);
      const data = await res.json();
      setChats(data.chats || []);
    }

    loadChats();
  }, [session?.user?.email]);

  // -------------------
  // RECHTS: MESSAGES LADEN
  // -------------------
  async function loadMessages() {
    const res = await fetch(`/api/chat/${chatId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
    setStudentEmail(data.studentEmail || "Schüler");
  }

  useEffect(() => {
    if (!chatId) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  // -------------------
  // MESSAGE SENDEN
  // -------------------
  async function sendMessage(e: any) {
    e.preventDefault();
    if (!input.trim()) return;

    await fetch(`/api/chat/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "teacher", text: input }),
    });

    setInput("");
    loadMessages();
  }

  return (
    <div className="flex h-[calc(100vh-70px)] bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-[300px] bg-white border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Chats</h2>

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => router.push(`/teacher/chat/${chat.id}`)}
            className={`p-3 rounded-lg cursor-pointer mb-2 shadow-sm border 
              hover:bg-blue-50 transition 
              ${chat.id === chatId ? "bg-blue-100 border-blue-500" : "bg-white"}
            `}
          >
            <p className="font-semibold text-gray-900">{chat.studentEmail}</p>
            <p className="text-xs text-gray-500">Chat öffnen →</p>
          </div>
        ))}
      </div>

      {/* CHAT RECHTS */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="px-5 py-4 bg-blue-600 text-white shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
            {studentEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-lg">{studentEmail}</p>
            <p className="text-xs opacity-80">Online</p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`max-w-xl px-4 py-2 rounded-xl shadow 
                ${msg.sender === "teacher"
                  ? "bg-blue-600 text-white ml-auto rounded-br-none"
                  : "bg-white text-gray-900 rounded-bl-none"
                }`}
            >
              {msg.text}
              <div className="text-xs opacity-70 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <form
          onSubmit={sendMessage}
          className="p-4 bg-white flex items-center gap-3 border-t"
        >
          <input
            type="text"
            placeholder="Nachricht schreiben..."
            className="flex-1 border rounded-full px-4 py-2 bg-gray-100 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Senden
          </button>
        </form>
      </div>
    </div>
  );
}
