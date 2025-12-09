"use client";
console.log("🔥 DIESE CHAT PAGE WIRD GERENDERT!");


import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function TeacherChatPage() {
  const { data: session } = useSession();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  // CHATLISTE LADEN
  useEffect(() => {
    if (!session?.user?.email) return;

    async function loadChats() {
      const res = await fetch(`/api/teacher/chat?email=${session.user.email}`);
      const data = await res.json();
      setChats(data.chats || []);
    }

    loadChats();
  }, [session?.user?.email]);


  // NACHRICHTEN LADEN
  async function loadMessages(chatId: string) {
    console.log("📥 Lade Nachrichten:", chatId);

    const res = await fetch(`/api/chat/${chatId}/messages`);
    console.log("📡 Status:", res.status);

    const data = await res.json();
    console.log("📦 Messages:", data);

    setMessages(data.messages || []);
    setSelectedChat({
      id: chatId,
      studentEmail: data.studentEmail,
    });
  }

  // Nachricht senden
  async function sendMessage(e: any) {
    e.preventDefault();
    if (!input.trim()) return;

    await fetch(`/api/chat/${selectedChat.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "teacher", text: input }),
    });

    setInput("");
    loadMessages(selectedChat.id);
  }

  return (
    <div className="flex h-[calc(100vh-70px)] bg-gray-100">
      
      {/* CHATLISTE */}
      <div className="w-[300px] bg-white border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Chats</h2>

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              console.log("💥 Chat angeklickt:", chat.id);
              loadMessages(chat.id);
            }}
            className={`p-3 rounded-lg cursor-pointer mb-2 shadow-sm border hover:bg-blue-50 transition`}
          >
            <p className="font-semibold">{chat.studentEmail}</p>
            <p className="text-xs text-gray-500">Anklicken</p>
          </div>
        ))}
      </div>

      {/* CHATFENSTER RECHTS */}
      <div className="flex-1 flex flex-col">

        {!selectedChat && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Wähle einen Chat aus
          </div>
        )}

        {selectedChat && (
          <>
            {/* HEADER */}
            <div className="px-5 py-4 bg-blue-600 text-white shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
                {selectedChat.studentEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{selectedChat.studentEmail}</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>

            {/* NACHRICHTEN */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-xl px-4 py-2 rounded-xl shadow 
                    ${msg.sender === "teacher"
                      ? "bg-blue-600 text-white ml-auto rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none"
                    }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* EINGABE */}
            <form onSubmit={sendMessage} className="p-4 bg-white flex items-center gap-3 border-t">
              <input
                type="text"
                placeholder="Nachricht schreiben..."
                className="flex-1 border rounded-full px-4 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                Senden
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
