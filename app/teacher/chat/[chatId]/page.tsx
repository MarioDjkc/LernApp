"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TeacherChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  async function loadMessages() {
    const res = await fetch(`/api/chat/${chatId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  useEffect(() => {
    if (!chatId) return;
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  async function sendMessage(e: any) {
    e.preventDefault();
    if (!input.trim()) return;

    await fetch(`/api/chat/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: "teacher",
        text: input,
      }),
    });

    setInput("");
    loadMessages();
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 h-[80vh] flex flex-col">
      <h1 className="text-xl font-bold mb-4">Chat</h1>

      <div className="flex-1 overflow-y-auto space-y-3 border rounded p-4 bg-gray-50">
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[70%] ${
              msg.sender === "teacher"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-300 text-black"
            }`}
          >
            {msg.text}
            <div className="text-xs opacity-60">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 mt-4">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Nachricht eingeben…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Senden
        </button>
      </form>
    </div>
  );
}
