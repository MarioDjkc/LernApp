"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function TeacherChatPage() {
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

  if (loading) {
    return <p className="p-6">Chats werden geladen…</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Chats</h1>

      {chats.length === 0 && (
        <p className="text-gray-500">Noch keine Chats vorhanden.</p>
      )}

      <div className="space-y-4">
        {chats.map((chat: any) => (
          <div
            key={chat.id}
            className="p-4 border rounded shadow hover:bg-gray-100 cursor-pointer"
          >
            <p className="font-semibold">{chat.studentEmail}</p>
            <p className="text-sm text-gray-500">Chat-ID: {chat.id}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
