"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
    if (status === "authenticated" && (session.user as any)?.role !== "student") {
      router.replace("/");
    }
  }, [status, session]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/student/unread-chats-count", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setUnreadChatCount(data.count ?? 0))
      .catch(() => {});
  }, [pathname, status]);

  const isActive = (path: string) =>
    pathname.startsWith(path)
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-blue-600";

  if (status === "loading" || status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVIGATION */}
      <nav className="w-full bg-white border-b shadow-sm px-6 py-4 flex items-center gap-6 text-lg">
        <Link href="/student/dashboard" className={isActive("/student/dashboard")}>
          Dashboard
        </Link>
        <Link href="/student/chat" className={`relative ${isActive("/student/chat")}`}>
          Chat
          {unreadChatCount > 0 && (
            <span className="absolute -bottom-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadChatCount}
            </span>
          )}
        </Link>
        <Link href="/student/payments" className={isActive("/student/payments")}>
          Payments
        </Link>
        <Link href="/student/profile" className={isActive("/student/profile")}>
          Profil
        </Link>

        <div className="ml-auto flex items-center gap-3 text-sm text-gray-500">
          <span>{session?.user?.name || session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium"
          >
            Abmelden
          </button>
        </div>
      </nav>

      {/* SEITEN-INHALT */}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
}
