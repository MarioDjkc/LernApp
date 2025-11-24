"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  async function loadMessages() {
    const res = await fetch(`/api/chat/${chatId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  async function sendMessage(e: any) {
    e.preventDefault();
    if (!text.trim()) return;

    await fetch(`/api/chat/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: "teacher",
        text,
      }),
    });

    setText("");
    loadMessages();
  }

  return (
    <>
      {/* LEFT SPACE (empty, because layout keeps structure) */}
      <div className="w-[30%] h-full" />

      {/* RIGHT CHAT */}
      <div className="flex-1 h-full flex flex-col">

        {/* HEADER */}
        <div className="h-[60px] bg-[#075E54] text-white flex items-center px-4 text-lg font-semibold shadow">
          Chat
        </div>

        {/* MESSAGE AREA */}
        <div className="flex-1 overflow-y-auto bg-[#e5ddd5] p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[60%] rounded-lg px-4 py-2 text-sm shadow ${
                msg.sender === "teacher"
                  ? "bg-[#dcf8c6] ml-auto"
                  : "bg-white"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* INPUT FIELD */}
        <form
          onSubmit={sendMessage}
          className="h-[70px] bg-white border-t flex items-center px-4 gap-3"
        >
          <input
            className="flex-1 border rounded-full px-4 py-2"
            placeholder="Nachricht schreiben…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            className="bg-[#128C7E] text-white px-5 py-2 rounded-lg hover:bg-[#0b5a4a]"
          >
            Senden
          </button>
        </form>
      </div>
    </>
  );
}
