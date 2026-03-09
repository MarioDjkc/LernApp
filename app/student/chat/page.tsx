// app/student/chat/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type ChatItem = {
  id: string;
  teacherEmail: string;
  teacherName?: string | null;
  subject?: string | null;
};

type Msg = {
  id: string;
  sender: "student" | "teacher" | "system";
  text: string;
  createdAt?: string;
};

export default function StudentChatPage() {
  const { data: session } = useSession();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [partnerEmail, setPartnerEmail] = useState<string>("");
  const [partnerName, setPartnerName] = useState<string>("");

  const [input, setInput] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const lastMsgIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------
  // CHATS LADEN (für Schüler)
  // ---------------------------
  useEffect(() => {
    async function loadChats() {
      if (!session?.user?.email) return;

      setLoadingChats(true);
      try {
        const res = await fetch(`/api/student/chat?email=${session.user.email}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));

        const list: ChatItem[] = data.chats || [];
        setChats(list);

        // auto-select ersten chat
        if (!selectedChat && list.length > 0) {
          setSelectedChat(list[0].id);
        }
      } finally {
        setLoadingChats(false);
      }
    }

    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  const selectedChatObj = useMemo(
    () => chats.find((c) => c.id === selectedChat) || null,
    [chats, selectedChat]
  );

  // ---------------------------
  // MESSAGES LADEN
  // (OHNE FLACKERN: nur setzen wenn neu)
  // ---------------------------
  useEffect(() => {
    if (!selectedChat) return;

    let alive = true;

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chat/${selectedChat}/messages`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));

        const newMessages: Msg[] = data.messages || [];

        // Partner-Daten (Header)
        const pe = selectedChatObj?.teacherEmail || data.teacherEmail || "";
        const pn = selectedChatObj?.teacherName || data.teacherName || "";

        if (!alive) return;

        // nur updaten wenn neue msg
        const newestId = newMessages.length ? newMessages[newMessages.length - 1].id : null;
        if (newestId && newestId !== lastMsgIdRef.current) {
          setMessages(newMessages);
          lastMsgIdRef.current = newestId;
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 10);
        } else if (!newestId && lastMsgIdRef.current !== null) {
          setMessages(newMessages);
          lastMsgIdRef.current = null;
        }

        setPartnerEmail(pe);
        setPartnerName(pn);

        // Als gelesen markieren
        fetch(`/api/chat/${selectedChat}/mark-read`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "student" }),
        }).catch(() => {});
      } finally {
        if (alive) setLoadingMessages(false);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 5000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [selectedChat, selectedChatObj]);

  // ---------------------------
  // SEND MESSAGE (Student)
  // ---------------------------
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChat) return;

    const text = input.trim();
    if (!text) return;

    // optimistic UI
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, sender: "student", text, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 10);

    await fetch(`/api/chat/${selectedChat}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "student", text }),
    }).catch(() => {});
  }

  return (
    <div className="flex h-[calc(100vh-70px)] bg-gray-100">
      {/* LINKS: Chat-Liste */}
      <aside className="w-[320px] bg-white border-r p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>

        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800 leading-relaxed">
          ★ Zufrieden mit deiner Stunde? Bewerte deinen Lehrer im{" "}
          <a href="/student/payments" className="font-semibold underline underline-offset-2 hover:text-amber-900">
            Payments-Tab
          </a>
          .
        </div>

        {loadingChats && <p className="text-sm text-gray-500">Lade Chats…</p>}

        {!loadingChats && chats.length === 0 && (
          <p className="text-sm text-gray-500">Noch keine Chats vorhanden.</p>
        )}

        <div className="space-y-3">
          {chats.map((chat) => {
            const active = selectedChat === chat.id;
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full text-left rounded-xl border p-3 transition ${
                  active ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="font-semibold text-sm">
                  {chat.teacherName || "Lehrer"}
                </div>
                <div className="text-xs text-gray-600 truncate">{chat.teacherEmail}</div>
                {chat.subject ? (
                  <div className="text-[11px] text-gray-500 mt-1">{chat.subject}</div>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      {/* RECHTS: Chat */}
      <section className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 bg-blue-600 text-white">
          <div className="text-lg font-semibold">
            {selectedChat ? (partnerName || partnerEmail || "Chat") : "Wähle einen Chat aus"}
          </div>
          {selectedChat && partnerEmail && (
            <div className="text-xs text-blue-100">{partnerEmail}</div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {loadingMessages && messages.length === 0 && (
            <p className="text-sm text-gray-500">Lade Nachrichten…</p>
          )}

          {!loadingMessages && selectedChat && messages.length === 0 && (
            <p className="text-sm text-gray-500">Noch keine Nachrichten.</p>
          )}

          {messages.map((msg) => {
            if (msg.sender === "system") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 shadow-sm">
                    <span className="mr-2">✅</span>
                    {msg.text}
                    {msg.createdAt ? (
                      <div className="mt-1 text-[10px] text-amber-700 text-right">
                        {new Date(msg.createdAt).toLocaleString("de-DE")}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            }

            const isStudent = msg.sender === "student";
            return (
              <div
                key={msg.id}
                className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[700px] rounded-2xl px-5 py-3 shadow-sm ${
                    isStudent ? "bg-blue-600 text-white" : "bg-white text-gray-900"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                  {msg.createdAt ? (
                    <div
                      className={`mt-1 text-[10px] ${
                        isStudent ? "text-blue-100" : "text-gray-400"
                      } text-right`}
                    >
                      {new Date(msg.createdAt).toLocaleString("de-DE")}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-3">
          <input
            type="text"
            className="flex-1 border rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={selectedChat ? "Nachricht schreiben..." : "Wähle zuerst einen Chat"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!selectedChat}
          />
          <button
            type="submit"
            disabled={!selectedChat || !input.trim()}
            className="px-8 rounded-full bg-blue-600 text-white font-semibold disabled:opacity-50"
          >
            Senden
          </button>
        </form>
      </section>
    </div>
  );
}
