"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ChatListPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    async function loadChats() {
      const res = await fetch(
        `/api/teacher/chats?email=${session.user.email}`
      );
      const data = await res.json();
      setChats(data.chats || []);
      setLoading(false);
    }

    loadChats();
  }, [session?.user?.email]);

  return (
    <>
      {/* LEFT SIDEBAR */}
      <div className="w-[30%] h-full bg-white border-r border-gray-300 flex flex-col">

        {/* HEADER */}
        <div className="h-[60px] bg-[#075E54] text-white flex items-center px-4 text-lg font-semibold shadow">
          Lehrer Chat
        </div>

        {/* Chats */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="p-4 text-gray-500">Chats werden geladen…</p>
          )}

          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/teacher/chat/${chat.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-semibold">
                {chat.studentEmail.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-semibold">{chat.studentEmail}</p>
                <p className="text-xs text-gray-500">Chat öffnen</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE EMPTY */}
      <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
        Wähle einen Chat aus
      </div>
    </>
  );
}
